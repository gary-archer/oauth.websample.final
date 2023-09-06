import EventBus from 'js-event-bus';
import {FetchCache} from '../api/client/fetchCache';
import {FetchClient} from '../api/client/fetchClient';
import {ViewModelCoordinator} from '../views/utilities/viewModelCoordinator';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {UIError} from '../plumbing/errors/uiError';
import {EventNames} from '../plumbing/events/eventNames';
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

    // Other infrastructure
    private readonly _eventBus: EventBus;
    private readonly _fetchCache: FetchCache;
    private readonly _viewModelCoordinator: ViewModelCoordinator;

    // Child view models
    private _companiesViewModel: CompaniesContainerViewModel | null;
    private _transactionsViewModel: TransactionsContainerViewModel | null;
    private _userInfoViewModel: UserInfoViewModel | null;

    // State flags
    private _error: UIError | null;
    private _isInitialising: boolean;
    private _isInitialised: boolean;
    private _isLoading: boolean;
    private _isLoaded: boolean;

    /*
     * Set the initial state when the app starts
     */
    public constructor() {

        // Objects that need configuration are initially null
        this._configuration = null;
        this._authenticator = null;
        this._fetchClient = null;

        // Create objects used for coordination
        this._eventBus = new EventBus();
        this._fetchCache = new FetchCache();
        this._viewModelCoordinator = new ViewModelCoordinator(this._eventBus, this._fetchCache);

        // Child view models
        this._companiesViewModel = null;
        this._transactionsViewModel = null;
        this._userInfoViewModel = null;

        // Top level error state
        this._error = null;

        // State flags
        this._isInitialising = false;
        this._isInitialised = false;
        this._isLoading = false;
        this._isLoaded = false;
        this._setupCallbacks();
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
            this._error = null;

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

            // Update state, to prevent model recreation if the view is recreated
            this._isInitialised = true;

        } catch (e: any) {

            // Render startup errors
            this._error = ErrorFactory.fromException(e);

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

            // Indicate loaded
            this._isLoaded = true;

            // If a login response was handled, return the pre-login location to navigate back to
            // This also avoids leaving the authorization code in the browser URL
            if (navigateTo) {
                return navigateTo;
            }

        } catch (e: any) {

            // Render errors and navigate home, to remove OAuth parameters from the browser URL
            this._error = ErrorFactory.fromException(e);
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
            this._error = ErrorFactory.fromException(e);
        }
    }

    /*
     * Trigger a logout and update error state if required
     */
    public async logout(): Promise<void> {

        try {
            await this._authenticator!.logout();
        } catch (e: any) {
            this._error = ErrorFactory.fromException(e);
        }
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
                this._viewModelCoordinator,
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
                this._viewModelCoordinator,
            );
        }

        return this._transactionsViewModel;
    }

    public getUserInfoViewModel(): UserInfoViewModel {

        if (!this._userInfoViewModel) {

            this._userInfoViewModel = new UserInfoViewModel(
                this._fetchClient!,
                this._eventBus,
                this._viewModelCoordinator,
            );
        }

        return this._userInfoViewModel;
    }

    /*
     * Ask all views to get updated data from the API
     */
    public reloadData(causeError: boolean): void {

        this._error = null;
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
            this._error = ErrorFactory.fromException(e);
        }
    }

    /*
     * For reliability testing, ask the OAuth agent to make the refresh token act expired, and handle errors
     */
    public async expireRefreshToken(): Promise<void> {

        try {
            await this._authenticator?.expireRefreshToken();
        } catch (e: any) {
            this._error = ErrorFactory.fromException(e);
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.reloadData = this.reloadData.bind(this);
    }
}
