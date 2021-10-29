import EventBus from 'js-event-bus';
import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
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
    private _apiViewEvents: ApiViewEvents | null;

    // Child view models
    private _companiesViewModel: CompaniesContainerViewModel | null;
    private _transactionsViewModel: TransactionsContainerViewModel | null;
    private _userInfoViewModel: UserInfoViewModel | null;

    public constructor() {

        this._configuration = null;
        this._authenticator = null;
        this._apiClient = null;
        this._eventBus = new EventBus();
        this._apiViewEvents = null;

        this._companiesViewModel = null;
        this._transactionsViewModel = null;
        this._userInfoViewModel = null;
    }

    /*
     * Some global objects are created after downloading configuration, which is only done once
     * The app view can be created many times and will get the same instance of the model
     */
    public async initialise(
        onLoginRequired: () => void,
        onLoginComplete: () => void,
        onMainLoadStateChanged: (enabled: boolean) => void): Promise<void> {

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
        this._authenticator = factory.createAuthenticator(onLoginComplete);
        this._apiClient = factory.createApiClient(this._authenticator);

        // Create a helper class to notify us about views that make API calls
        // This will enable us to only trigger any login redirects once, after all views have tried to load
        this._apiViewEvents = new ApiViewEvents(onLoginRequired, onMainLoadStateChanged);
        this._apiViewEvents.addView(ApiViewNames.Main);
        this._apiViewEvents.addView(ApiViewNames.UserInfo);
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
        return this._apiViewEvents!;
    }

    /*
     * Return child view models when requested
     */
    public getCompaniesViewModel(): CompaniesContainerViewModel {

        if (!this._companiesViewModel) {

            this._companiesViewModel = {
                apiClient: this._apiClient!,
                eventBus: this._eventBus,
                apiViewEvents: this._apiViewEvents!,
            };
        }

        return this._companiesViewModel;
    }

    public getTransactionsViewModel(): TransactionsContainerViewModel {

        if (!this._transactionsViewModel) {

            this._transactionsViewModel = {
                apiClient: this._apiClient!,
                eventBus: this._eventBus,
                apiViewEvents: this._apiViewEvents!,
            };
        }

        return this._transactionsViewModel;
    }

    public getUserInfoViewModel(): UserInfoViewModel {

        if (!this._userInfoViewModel) {

            this._userInfoViewModel = {
                apiClient: this._apiClient!,
                eventBus: this._eventBus,
                apiViewEvents: this._apiViewEvents!,
            };
        }

        return this._userInfoViewModel;
    }
}
