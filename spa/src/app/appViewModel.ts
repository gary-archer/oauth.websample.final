import EventBus from 'js-event-bus';
import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {EventNames} from '../plumbing/events/eventNames';
import {ReloadMainViewEvent} from '../plumbing/events/reloadMainViewEvent';
import {ReloadUserInfoEvent} from '../plumbing/events/reloadUserInfoEvent';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {ObjectFactory} from '../plumbing/utilities/objectFactory';
import {CompaniesContainerViewModel} from '../views/companies/companiesContainerViewModel';
import {TransactionsContainerViewModel} from '../views/transactions/transactionsContainerViewModel';
import {UserInfoViewModel} from '../views/userInfo/userInfoViewModel';
import {ApiViewEvents} from '../views/utilities/apiViewEvents';
import {ApiViewNames} from '../views/utilities/apiViewNames';

/*
 * Global objects as input to the application view
 */
export class AppViewModel {

    // Global objects
    private _configuration: Configuration | null;
    private _authenticator: Authenticator | null;
    private _apiClient: ApiClient | null;
    private _eventBus: EventBus;
    private _apiViewEvents: ApiViewEvents;

    // Child view models
    private _companiesViewModel: CompaniesContainerViewModel | null;
    private _transactionsViewModel: TransactionsContainerViewModel | null;
    private _userInfoViewModel: UserInfoViewModel | null;

    public constructor() {

        // Objects that need configuration are initially null
        this._configuration = null;
        this._authenticator = null;
        this._apiClient = null;

        // Create the event bus for communicating between views
        this._eventBus = new EventBus();

        // Create a helper class to notify us about views that make API calls
        // This will enable us to only trigger any login redirects once, after all views have tried to load
        this._apiViewEvents = new ApiViewEvents(this._eventBus);
        this._apiViewEvents.addView(ApiViewNames.Main);
        this._apiViewEvents.addView(ApiViewNames.UserInfo);

        // Child view models
        this._companiesViewModel = null;
        this._transactionsViewModel = null;
        this._userInfoViewModel = null;
        this._setupCallbacks();
    }

    /*
     * Some global objects are created after downloading configuration, which is only done once
     * The app view can be created many times and will get the same instance of the model
     */
    public async initialise(): Promise<void> {

        if (this.configuration  != null &&
            this._authenticator != null &&
            this._apiClient     != null &&
            this._apiViewEvents != null) {

            return;
        }

        const loader = new ConfigurationLoader();
        this._configuration = await loader.download();

        // Create global objects for managing OAuth and API calls
        const factory = new ObjectFactory(this.configuration);
        this._authenticator = factory.createAuthenticator(this._eventBus);
        this._apiClient = factory.createApiClient(this._authenticator);
    }

    /*
     * Return objects once created
     */
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

    public get apiViewEvents(): ApiViewEvents {
        return this._apiViewEvents;
    }

    /*
     * Return child view models when requested
     */
    public getCompaniesViewModel(): CompaniesContainerViewModel {

        if (!this._companiesViewModel) {

            this._companiesViewModel = {
                apiClient: this._apiClient!,
                eventBus: this._eventBus,
                apiViewEvents: this._apiViewEvents,
            };
        }

        return this._companiesViewModel;
    }

    public getTransactionsViewModel(): TransactionsContainerViewModel {

        if (!this._transactionsViewModel) {

            this._transactionsViewModel = {
                apiClient: this._apiClient!,
                eventBus: this._eventBus,
                apiViewEvents: this._apiViewEvents,
            };
        }

        return this._transactionsViewModel;
    }

    public getUserInfoViewModel(): UserInfoViewModel {

        if (!this._userInfoViewModel) {

            this._userInfoViewModel = {
                apiClient: this._apiClient!,
                eventBus: this._eventBus,
                apiViewEvents: this._apiViewEvents,
            };
        }

        return this._userInfoViewModel;
    }

    /*
     * Ask all views to get updated data from the API
     */
    public reloadData(causeError: boolean): void {

        this._apiViewEvents.clearState();
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
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.reloadData = this.reloadData.bind(this);
        this.reloadMainView = this.reloadMainView.bind(this);
    }
}
