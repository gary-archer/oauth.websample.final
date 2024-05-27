import EventBus from 'js-event-bus';
import {Dispatch, SetStateAction, useState} from 'react';
import {FetchCache} from '../api/client/fetchCache';
import {FetchClient} from '../api/client/fetchClient';
import {ViewModelCoordinator} from '../views/utilities/viewModelCoordinator';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {UIError} from '../plumbing/errors/uiError';
import {EventNames} from '../plumbing/events/eventNames';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ReloadDataEvent} from '../plumbing/events/reloadDataEvent';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {AuthenticatorImpl} from '../plumbing/oauth/authenticatorImpl';
import {SessionManager} from '../plumbing/utilities/sessionManager';
import {CompaniesContainerViewModel} from '../views/companies/companiesContainerViewModel';
import {TransactionsContainerViewModel} from '../views/transactions/transactionsContainerViewModel';
import {UserInfoViewModel} from '../views/userInfo/userInfoViewModel';

/*
 * Global objects as input to the application view
 */
export class AppViewModel {

    // Global objects created from configuration
    private _configuration: Configuration | null;
    private _authenticator: Authenticator | null;
    private _fetchClient: FetchClient | null;
    private _viewModelCoordinator: ViewModelCoordinator | null;

    // Other infrastructure
    private readonly _eventBus: EventBus;
    private readonly _fetchCache: FetchCache;

    // State
    private _error: UIError | null;
    private _isInitialising: boolean;
    private _isInitialised: boolean;
    private _isLoading: boolean;
    private _isLoaded: boolean;

    // Child view models
    private _companiesViewModel: CompaniesContainerViewModel | null;
    private _transactionsViewModel: TransactionsContainerViewModel | null;
    private _userInfoViewModel: UserInfoViewModel | null;

    // Callbacks to set model properties that affect view rendering
    private _setIsLoaded: Dispatch<SetStateAction<boolean>> | null;
    private _setError: Dispatch<SetStateAction<UIError | null>> | null;

    /*
     * Set the initial state when the app starts
     */
    public constructor() {

        // Objects that need configuration are initially null
        this._configuration = null;
        this._authenticator = null;
        this._fetchClient = null;
        this._viewModelCoordinator = null;

        // Create objects used for coordination
        this._eventBus = new EventBus();
        this._fetchCache = new FetchCache();

        // Set initial state
        this._error = null;
        this._isInitialising = false;
        this._isInitialised = false;
        this._isLoading = false;
        this._isLoaded = false;
        this._setIsLoaded = null;
        this._setError = null;

        // Initialize child view models
        this._companiesViewModel = null;
        this._transactionsViewModel = null;
        this._userInfoViewModel = null;
        this._setupCallbacks();
    }

    /*
     * For the correct React behavior, the view initializes state every time it loads
     */
    public useState(): void {

        const [, setIsLoaded] = useState(this._isLoaded);
        this._setIsLoaded = setIsLoaded;

        const [, setError] = useState(this._error);
        this._setError = setError;
    }

    /*
     * Some global objects are created after initialising configuration, which is only done once
     * The app view can be created many times and will get the same instance of the model
     */
    public async initialise(): Promise<void> {

        if (this._isInitialised || this._isInitialising) {
            return;
        }

        try {

            // Prevent re-entrancy due to React strict mode
            this._isInitialising = true;
            this._updateError(null);

            // Get the application configuration
            const loader = new ConfigurationLoader();
            this._configuration = await loader.get();

            // Create an API session ID
            const sessionId = SessionManager.get();

            // Create an object to manage OAuth related operations
            this._authenticator = new AuthenticatorImpl(this._configuration, sessionId);

            // Create a client for calling the API
            this._fetchClient = new FetchClient(
                this.configuration,
                this._fetchCache,
                this._authenticator,
                sessionId);

            // Create an object used to deal with API responses across multiple views
            this._viewModelCoordinator = new ViewModelCoordinator(
                this._eventBus,
                this._fetchCache,
                this._authenticator!);

            // Update state, to prevent model recreation if the view is recreated
            this._isInitialised = true;

        } catch (e: any) {

            // Render startup errors
            this._updateError(ErrorFactory.fromException(e));

        } finally {

            // Reset to allow retries
            this._isInitialising = false;
        }
    }

    /*
     * Set up the authenticated state and handle login responses
     */
    public async handlePageLoad(): Promise<string | null> {

        if (!this._isInitialised || this._isLoading) {
            return null;
        }

        try {

            // Prevent re-entrancy due to React strict mode
            this._isLoading = true;

            // Handle any login responses
            const navigateTo = await this._authenticator!.handlePageLoad();

            // Inform the view that loading is complete
            this._updateIsLoaded(true);

            // If a login response was handled, return the pre-login location to navigate back to
            // This also avoids leaving the authorization code in the browser URL
            if (navigateTo) {
                return navigateTo;
            }

        } catch (e: any) {

            // Render errors and navigate home, to remove OAuth parameters from the browser URL
            this._updateError(ErrorFactory.fromException(e));
            return '/';

        } finally {

            // Reset to allow retries
            this._isLoading = false;
        }

        return null;
    }

    /*
     * Trigger a login and update error state if required
     */
    public async login(currentLocation: string): Promise<void> {

        try {
            await this._authenticator!.login(currentLocation);
        } catch (e: any) {
            this._updateError(ErrorFactory.fromException(e));
        }
    }

    /*
     * Try to logout and swallow any errors
     */
    public async logout(): Promise<boolean> {

        try {
            await this._authenticator!.logout();
            return true;

        } catch (e: any) {

            ErrorConsoleReporter.output(ErrorFactory.fromException(e));
            return false;
        }
    }

    /*
     * Clean up state after a logout on another browser tab
     */
    public onLoggedOut(): void {

        this._viewModelCoordinator!.resetState();
        this._authenticator!.clearLoginState();
        this._updateError(null);
    }

    /*
     * Property accessors
     */
    public get isInitialised(): boolean {
        return this._isInitialised;
    }

    public get isLoaded(): boolean {
        return this._isLoaded;
    }

    public get error(): UIError | null {
        return this._error;
    }

    public get configuration(): Configuration {
        return this._configuration!;
    }

    public get authenticator(): Authenticator {
        return this._authenticator!;
    }

    public get fetchClient(): FetchClient {
        return this._fetchClient!;
    }

    public get eventBus(): EventBus {
        return this._eventBus;
    }

    /*
     * Return child view models when requested
     */
    public getCompaniesViewModel(): CompaniesContainerViewModel {

        if (!this._companiesViewModel) {

            this._companiesViewModel = new CompaniesContainerViewModel(
                this._fetchClient!,
                this._eventBus,
                this._viewModelCoordinator!,
            );
        }

        return this._companiesViewModel;
    }

    public getTransactionsViewModel(): TransactionsContainerViewModel {

        if (!this._transactionsViewModel) {

            this._transactionsViewModel = new TransactionsContainerViewModel
            (
                this._fetchClient!,
                this._eventBus,
                this._viewModelCoordinator!,
            );
        }

        return this._transactionsViewModel;
    }

    public getUserInfoViewModel(): UserInfoViewModel {

        if (!this._userInfoViewModel) {

            this._userInfoViewModel = new UserInfoViewModel(
                this._fetchClient!,
                this._eventBus,
                this._viewModelCoordinator!,
            );
        }

        return this._userInfoViewModel;
    }

    /*
     * Ask all views to get updated data from the API
     */
    public reloadData(causeError: boolean): void {

        this._updateError(null);
        this._viewModelCoordinator!.resetState();
        this._eventBus.emit(EventNames.ReloadData, null, new ReloadDataEvent(causeError));
    }

    /*
     * See if there are any errors
     */
    public hasError(): boolean {
        return !!this._error || this._viewModelCoordinator!.hasErrors();
    }

    /*
     * For reliability testing, ask the OAuth agent to make the access token act expired, and handle errors
     */
    public async expireAccessToken(): Promise<void> {

        try {
            await this._authenticator?.expireAccessToken();
        } catch (e: any) {
            this._updateError(ErrorFactory.fromException(e));
        }
    }

    /*
     * For reliability testing, ask the OAuth agent to make the refresh token act expired, and handle errors
     */
    public async expireRefreshToken(): Promise<void> {

        try {
            await this._authenticator?.expireRefreshToken();
        } catch (e: any) {
            this._updateError(ErrorFactory.fromException(e));
        }
    }

    /*
     * Update loaded state and the binding system
     */
    private _updateIsLoaded(isLoaded: boolean): void {
        this._isLoaded = isLoaded;
        this._setIsLoaded!(isLoaded);
    }

    /*
     * Update error state and the binding system
     */
    private _updateError(error: UIError | null): void {
        this._error = error;
        this._setError!(error);
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.reloadData = this.reloadData.bind(this);
    }
}
