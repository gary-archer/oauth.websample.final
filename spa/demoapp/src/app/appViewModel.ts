import EventBus from 'js-event-bus';
import {ApiClient} from '../api/client/apiClient';
import {ViewModelCoordinator} from '../views/utilities/viewModelCoordinator';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {BaseErrorFactory, UIError} from '../plumbing/errors/lib';
import {EventNames} from '../plumbing/events/eventNames';
import {ReloadDataEvent} from '../plumbing/events/reloadDataEvent';
import {HttpRequestCache} from '../plumbing/http/httpRequestCache';
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
    private _apiClient: ApiClient | null;

    // Other global objects
    private readonly _httpRequestCache: HttpRequestCache;
    private readonly _viewModelCoordinator: ViewModelCoordinator;
    private readonly _eventBus: EventBus;

    // Child view models
    private _companiesViewModel: CompaniesContainerViewModel | null;
    private _transactionsViewModel: TransactionsContainerViewModel | null;
    private _userInfoViewModel: UserInfoViewModel | null;

    // State flags
    private _error: UIError | null;
    private _isInitialised: boolean;

    /*
     * Set the initial state when the app starts
     */
    public constructor() {

        // Objects that need configuration are initially null
        this._configuration = null;
        this._authenticator = null;
        this._apiClient = null;

        // Create objects used for managing communication across views
        this._eventBus = new EventBus();
        this._httpRequestCache = new HttpRequestCache();
        this._viewModelCoordinator = new ViewModelCoordinator(this._httpRequestCache, this._eventBus);

        // Child view models
        this._companiesViewModel = null;
        this._transactionsViewModel = null;
        this._userInfoViewModel = null;

        // Other state
        this._error = null;
        this._isInitialised = false;
        this._setupCallbacks();
    }

    /*
     * Some global objects are created after initializing configuration, which is only done once
     * The app view can be created many times and will get the same instance of the model
     */
    public async initialise(): Promise<void> {

        if (!this._isInitialised) {

            try {

                // Get the application configuration
                this._error = null;
                const loader = new ConfigurationLoader();
                this._configuration = await loader.get();

                // Create an API session ID
                const sessionId = SessionManager.get();

                // Create an authentication for OAuth operations
                this._authenticator = new AuthenticatorImpl(this._configuration, sessionId);

                // Create a client for calling the API
                this._apiClient = new ApiClient(
                    this.configuration,
                    sessionId,
                    this._authenticator,
                    this._httpRequestCache);

                // Update state
                this._isInitialised = true;

            } catch (e: any) {

                // Render startup errors
                this._error = BaseErrorFactory.fromException(e);
            }
        }
    }

    /*
     * Property accessors
     */
    public get isInitialised(): boolean {
        return this._isInitialised;
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

    public get apiClient(): ApiClient {
        return this._apiClient!;
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
                this._apiClient!,
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
                this._apiClient!,
                this._eventBus,
                this._viewModelCoordinator,
            );
        }

        return this._transactionsViewModel;
    }

    public getUserInfoViewModel(): UserInfoViewModel {

        if (!this._userInfoViewModel) {

            this._userInfoViewModel = new UserInfoViewModel(
                this.authenticator!,
                this._apiClient!,
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
        this._eventBus.emit(EventNames.ReloadData, null, new ReloadDataEvent(causeError));
    }

    /*
     * Reload data after an error
     */
    public reloadDataOnError(): void {

        if (this._viewModelCoordinator.hasErrors()) {
            this.reloadData(false);
        }
    }

    /*
     * For reliability testing, ask the OAuth agent to make the access token act expired, and handle errors
     */
    public async expireAccessToken(): Promise<void> {

        try {
            await this._authenticator?.expireAccessToken();
        } catch (e: any) {
            this._error = BaseErrorFactory.fromException(e);
        }
    }

    /*
     * For reliability testing, ask the OAuth agent to make the refresh token act expired, and handle errors
     */
    public async expireRefreshToken(): Promise<void> {

        try {
            await this._authenticator?.expireRefreshToken();
        } catch (e: any) {
            this._error = BaseErrorFactory.fromException(e);
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.reloadData = this.reloadData.bind(this);
    }
}
