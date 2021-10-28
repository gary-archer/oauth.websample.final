import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {ObjectFactory} from '../plumbing/utilities/objectFactory';
import {ApiViewEvents} from '../views/utilities/apiViewEvents';
import {ApiViewNames} from '../views/utilities/apiViewNames';

/*
 * Global objects as input to the application view
 */
export class AppViewModel {

    private _configuration: Configuration | null;
    private _authenticator: Authenticator | null;
    private _apiClient: ApiClient | null;
    private _apiViewEvents: ApiViewEvents | null;

    public constructor() {
        this._configuration = null;
        this._authenticator = null;
        this._apiClient = null;
        this._apiViewEvents = null;
    }

    /*
     * Global objects are created after downloading configuration, which is only done once
     * The app view can be created many times and will get the same instance of the model
     */
    public async initialise(
        onLoginRequired: () => void,
        onLoginComplete: () => void,
        onMainLoadStateChanged: (enabled: boolean) => void): Promise<void> {

        if (this.configuration != null &&
            this._authenticator != null &&
            this.apiClient != null &&
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

    public get apiViewEvents(): ApiViewEvents {
        return this._apiViewEvents!;
    }
}
