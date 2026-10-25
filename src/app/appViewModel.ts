import EventBus from 'js-event-bus';
import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {UIError} from '../plumbing/errors/uiError';
import {EventNames} from '../plumbing/events/eventNames';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ReloadDataEvent} from '../plumbing/events/reloadDataEvent';
import {OAuthClient} from '../plumbing/oauth/oauthClient';
import {OAuthClientImpl} from '../plumbing/oauth/oauthClientImpl';
import {ViewModelStore} from './viewModelStore';

/*
 * Manages global objects for the React application
 */
export class AppViewModel {

    private configuration!: Configuration;
    private oauthClient!: OAuthClient;
    private apiClient!: ApiClient;
    private viewModelStore!: ViewModelStore;
    private readonly eventBus: EventBus;

    private error: UIError | null;
    private isInitialising: boolean;
    private isInitialised: boolean;
    private isLoading: boolean;
    private isLoaded: boolean;

    /*
     * Set the initial state when the app starts
     */
    public constructor() {

        this.eventBus = new EventBus();

        this.error = null;
        this.isInitialising = false;
        this.isInitialised = false;
        this.isLoading = false;
        this.isLoaded = false;
        this.setupCallbacks();
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
            this.error = null;

            // Get the application configuration
            const loader = new ConfigurationLoader();
            this.configuration = await loader.get();

            // Create an object to manage OAuth related operations
            this.oauthClient = new OAuthClientImpl(this.configuration);

            // Create a client for calling the API
            this.apiClient = new ApiClient(this.configuration, this.oauthClient, this.eventBus);

            // Create an object to store view models
            this.viewModelStore = new ViewModelStore(this.apiClient, this.eventBus);

            // Update state, to prevent model recreation if the view is recreated
            this.isInitialised = true;

        } catch (e: any) {

            // Render startup errors
            this.error = ErrorFactory.fromException(e);

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
            this.isLoaded = true;

            // If a login response was handled, return the pre-login location to navigate back to
            // This also avoids leaving the authorization code in the browser URL
            if (navigateTo) {
                return navigateTo;
            }

        } catch (e: any) {

            // Render errors and navigate home, to remove OAuth parameters from the browser URL
            this.error = ErrorFactory.fromException(e);
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
            this.error = ErrorFactory.fromException(e);
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

        this.oauthClient.clearState();
        this.apiClient.clearState();
        this.error = null;
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

    public getEventBus(): EventBus {
        return this.eventBus;
    }

    public getViewModelStore(): ViewModelStore {
        return this.viewModelStore;
    }

    /*
     * Raise an event to ask all views to get updated data from the API
     */
    public triggerDataReload(causeError: boolean): void {

        this.error = null;
        this.eventBus.emit(EventNames.ReloadData, null, new ReloadDataEvent(causeError));
    }

    /*
     * See if the last batch of API requests resulted in errors
     */
    public hasErrors(): boolean {
        return !!this.error || this.apiClient.hasErrors();
    }

    /*
     * For reliability testing, ask the OAuth agent to make the access token act expired, and handle errors
     */
    public async expireAccessToken(): Promise<void> {

        try {
            await this.oauthClient.expireAccessToken();
        } catch (e: any) {
            this.error = ErrorFactory.fromException(e);
        }
    }

    /*
     * For reliability testing, ask the OAuth agent to make the refresh token act expired, and handle errors
     */
    public async expireRefreshToken(): Promise<void> {

        try {
            await this.oauthClient.expireRefreshToken();
        } catch (e: any) {
            this.error = ErrorFactory.fromException(e);
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private setupCallbacks() {
        this.triggerDataReload = this.triggerDataReload.bind(this);
    }
}
