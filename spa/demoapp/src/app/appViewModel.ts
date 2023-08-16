import EventBus from 'js-event-bus';
import {ApiClient} from '../api/client/apiClient';
import {ApiCoordinator} from '../api/client/apiCoordinator';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {EventNames} from '../plumbing/events/eventNames';
import {ReloadMainViewEvent} from '../plumbing/events/reloadMainViewEvent';
import {ReloadUserInfoEvent} from '../plumbing/events/reloadUserInfoEvent';
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
    private readonly _eventBus: EventBus;
    private readonly _apiCoordinator: ApiCoordinator;

    // Child view models
    private _companiesViewModel: CompaniesContainerViewModel | null;
    private _transactionsViewModel: TransactionsContainerViewModel | null;
    private _userInfoViewModel: UserInfoViewModel | null;

    // State flags
    private _isInitialised: boolean;

    /*
     * Set the initial state when the app starts
     */
    public constructor() {

        // Objects that need configuration are initially null
        this._configuration = null;
        this._authenticator = null;
        this._apiClient = null;
        this._httpRequestCache = new HttpRequestCache();

        // Create objects used for communicating across views
        this._eventBus = new EventBus();
        this._apiCoordinator = new ApiCoordinator(this._httpRequestCache, this._eventBus);

        // Child view models
        this._companiesViewModel = null;
        this._transactionsViewModel = null;
        this._userInfoViewModel = null;

        // Flags
        this._isInitialised = false;
        this._setupCallbacks();
    }

    /*
     * Some global objects are created after initializing configuration, which is only done once
     * The app view can be created many times and will get the same instance of the model
     */
    public async initialise(): Promise<void> {

        if (!this._isInitialised) {

            // Get the application configuration
            const loader = new ConfigurationLoader();
            this._configuration = await loader.get();

            // Create global objects for managing OAuth and API calls
            const sessionId = SessionManager.get();
            this._authenticator = new AuthenticatorImpl(this._configuration, sessionId);
            this._apiClient = new ApiClient(
                this.configuration,
                sessionId,
                this._authenticator,
                this._httpRequestCache);

            // Update state
            this._isInitialised = true;
        }
    }

    /*
     * Return other details to the view
     */
    public get isInitialised(): boolean {
        return this._isInitialised;
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
                this._apiCoordinator,
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
                this._apiCoordinator,
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
                this._apiCoordinator,
            );
        }

        return this._userInfoViewModel;
    }

    /*
     * Ask all views to get updated data from the API
     */
    public reloadData(causeError: boolean): void {
        this._eventBus.emit(EventNames.ReloadMainView, null, new ReloadMainViewEvent(causeError));
        this._eventBus.emit(EventNames.ReloadUserInfo, null, new ReloadUserInfoEvent(causeError));
    }

    /*
     * Reload only the main view
     */
    public reloadMainView(): void {
        this._eventBus.emit(EventNames.ReloadMainView, null, new ReloadMainViewEvent(false));
    }

    /*
     * Reload only user info
     */
    public reloadUserInfo(): void {
        this._eventBus.emit(EventNames.ReloadUserInfo, null, new ReloadUserInfoEvent(false));
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.reloadData = this.reloadData.bind(this);
        this.reloadMainView = this.reloadMainView.bind(this);
    }
}
