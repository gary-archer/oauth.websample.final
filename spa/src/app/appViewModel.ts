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
import {OAuthClient} from '../plumbing/oauth/oauthClient';
import {OAuthClientImpl} from '../plumbing/oauth/oauthClientImpl';
import {SessionManager} from '../plumbing/utilities/sessionManager';
import {CompaniesContainerViewModel} from '../views/companies/companiesContainerViewModel';
import {TransactionsContainerViewModel} from '../views/transactions/transactionsContainerViewModel';
import {UserInfoViewModel} from '../views/userInfo/userInfoViewModel';

/*
 * Global objects as input to the application view
 */
export class AppViewModel {

    // Global objects created from configuration
    private configuration!: Configuration;
    private oauthClient!: OAuthClient;
    private fetchClient!: FetchClient;
    private viewModelCoordinator!: ViewModelCoordinator;

    // Other infrastructure
    private readonly eventBus: EventBus;
    private readonly fetchCache: FetchCache;

    // State
    private error: UIError | null;
    private isInitialising: boolean;
    private isInitialised: boolean;
    private isLoading: boolean;
    private isLoaded: boolean;

    // Child view models
    private companiesViewModel: CompaniesContainerViewModel | null;
    private transactionsViewModel: TransactionsContainerViewModel | null;
    private userInfoViewModel: UserInfoViewModel | null;

    // Callbacks to set model properties that affect view rendering
    private setIsLoaded: Dispatch<SetStateAction<boolean>> | null;
    private setError: Dispatch<SetStateAction<UIError | null>> | null;

    /*
     * Set the initial state when the app starts
     */
    public constructor() {

        // Create objects used for coordination
        this.eventBus = new EventBus();
        this.fetchCache = new FetchCache();

        // Set initial state
        this.error = null;
        this.isInitialising = false;
        this.isInitialised = false;
        this.isLoading = false;
        this.isLoaded = false;
        this.setIsLoaded = null;
        this.setError = null;

        // Initialize child view models
        this.companiesViewModel = null;
        this.transactionsViewModel = null;
        this.userInfoViewModel = null;
        this.setupCallbacks();
    }

    /*
     * For the correct React behavior, the view initializes state every time it loads
     */
    public useState(): void {

        const [, setIsLoaded] = useState(this.isLoaded);
        this.setIsLoaded = setIsLoaded;

        const [, setError] = useState(this.error);
        this.setError = setError;
    }

    /*
     * Some global objects are created after initialising configuration, which is only done once
     * The app view can be created many times and will get the same instance of the model
     */
    public async initialise(): Promise<void> {

        if (this.isInitialised || this.isInitialising) {
            return;
        }

        try {

            // Prevent re-entrancy due to React strict mode
            this.isInitialising = true;
            this.updateError(null);

            // Get the application configuration
            const loader = new ConfigurationLoader();
            this.configuration = await loader.get();

            // Create an API session ID
            const sessionId = SessionManager.get();

            // Create an object to manage OAuth related operations
            this.oauthClient = new OAuthClientImpl(this.configuration);

            // Create a client for calling the API
            this.fetchClient = new FetchClient(
                this.configuration,
                this.fetchCache,
                this.oauthClient,
                sessionId);

            // Create an object used to deal with API responses across multiple views
            this.viewModelCoordinator = new ViewModelCoordinator(this.eventBus, this.fetchCache);

            // Update state, to prevent model recreation if the view is recreated
            this.isInitialised = true;

        } catch (e: any) {

            // Render startup errors
            this.updateError(ErrorFactory.fromException(e));

        } finally {

            // Reset to allow retries
            this.isInitialising = false;
        }
    }

    /*
     * Set up the authenticated state and handle login responses
     */
    public async handlePageLoad(): Promise<string | null> {

        if (!this.isInitialised || this.isLoading) {
            return null;
        }

        try {

            // Prevent re-entrancy due to React strict mode
            this.isLoading = true;

            // Handle any login responses
            const navigateTo = await this.oauthClient.handlePageLoad();

            // Inform the view that loading is complete
            this.updateIsLoaded(true);

            // If a login response was handled, return the pre-login location to navigate back to
            // This also avoids leaving the authorization code in the browser URL
            if (navigateTo) {
                return navigateTo;
            }

        } catch (e: any) {

            // Render errors and navigate home, to remove OAuth parameters from the browser URL
            this.updateError(ErrorFactory.fromException(e));
            return '/';

        } finally {

            // Reset to allow retries
            this.isLoading = false;
        }

        return null;
    }

    /*
     * Trigger a login and update error state if required
     */
    public async login(currentLocation: string): Promise<void> {

        try {
            await this.oauthClient.login(currentLocation);
        } catch (e: any) {
            this.updateError(ErrorFactory.fromException(e));
        }
    }

    /*
     * Try to logout and swallow any errors
     */
    public async logout(): Promise<boolean> {

        try {
            await this.oauthClient.logout();
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

        this.viewModelCoordinator.resetState();
        this.oauthClient.clearLoginState();
        this.updateError(null);
    }

    /*
     * Property accessors
     */
    public getIsInitialised(): boolean {
        return this.isInitialised;
    }

    public getIsLoaded(): boolean {
        return this.isLoaded;
    }

    public getError(): UIError | null {
        return this.error;
    }

    public getConfiguration(): Configuration {
        return this.configuration;
    }

    public getOAuthClient(): OAuthClient {
        return this.oauthClient;
    }

    public getFetchClient(): FetchClient {
        return this.fetchClient;
    }

    public getEventBus(): EventBus {
        return this.eventBus;
    }

    /*
     * Return child view models when requested
     */
    public getCompaniesViewModel(): CompaniesContainerViewModel {

        if (!this.companiesViewModel) {

            this.companiesViewModel = new CompaniesContainerViewModel(
                this.fetchClient,
                this.eventBus,
                this.viewModelCoordinator,
            );
        }

        return this.companiesViewModel;
    }

    public getTransactionsViewModel(): TransactionsContainerViewModel {

        if (!this.transactionsViewModel) {

            this.transactionsViewModel = new TransactionsContainerViewModel
            (
                this.fetchClient,
                this.eventBus,
                this.viewModelCoordinator,
            );
        }

        return this.transactionsViewModel;
    }

    public getUserInfoViewModel(): UserInfoViewModel {

        if (!this.userInfoViewModel) {

            this.userInfoViewModel = new UserInfoViewModel(
                this.fetchClient,
                this.eventBus,
                this.viewModelCoordinator,
            );
        }

        return this.userInfoViewModel;
    }

    /*
     * Ask all views to get updated data from the API
     */
    public reloadData(causeError: boolean): void {

        this.updateError(null);
        this.viewModelCoordinator.resetState();
        this.eventBus.emit(EventNames.ReloadData, null, new ReloadDataEvent(causeError));
    }

    /*
     * See if there are any errors
     */
    public hasError(): boolean {
        return !!this.error || this.viewModelCoordinator.hasErrors();
    }

    /*
     * For reliability testing, ask the OAuth agent to make the access token act expired, and handle errors
     */
    public async expireAccessToken(): Promise<void> {

        try {
            await this.oauthClient.expireAccessToken();
        } catch (e: any) {
            this.updateError(ErrorFactory.fromException(e));
        }
    }

    /*
     * For reliability testing, ask the OAuth agent to make the refresh token act expired, and handle errors
     */
    public async expireRefreshToken(): Promise<void> {

        try {
            await this.oauthClient.expireRefreshToken();
        } catch (e: any) {
            this.updateError(ErrorFactory.fromException(e));
        }
    }

    /*
     * Update loaded state and the binding system
     */
    private updateIsLoaded(isLoaded: boolean): void {

        this.isLoaded = isLoaded;
        if (this.setIsLoaded) {
            this.setIsLoaded(isLoaded);
        }
    }

    /*
     * Update error state and the binding system
     */
    private updateError(error: UIError | null): void {

        this.error = error;
        if (this.setError) {
            this.setError(error);
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private setupCallbacks() {
        this.reloadData = this.reloadData.bind(this);
    }
}
