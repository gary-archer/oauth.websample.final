import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {SessionManager} from '../plumbing/utilities/sessionManager';

/*
 * Global objects as input to the application view
 */
export class AppViewModel {

    // Global objects
    private _configuration: Configuration | null;
    private _authenticator: Authenticator | null;

    // State flags
    private _isInitialised: boolean;

    /*
     * Set the initial state when the app starts
     */
    public constructor() {

        // Objects that need configuration are initially null
        this._configuration = null;
        this._authenticator = null;
        this._isInitialised = false;
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
            const authenticator = new Authenticator(this._configuration, sessionId);
            this._authenticator = authenticator;

            // Update state
            this._isInitialised = true;
        }
    }

    /*
     * Return details to the view
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
}
