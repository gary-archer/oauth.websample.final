import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {SessionManager} from '../plumbing/utilities/sessionManager';
import {Router} from '../views/router';

/*
 * The main application class
 */
export class App {

    private _configuration?: Configuration;
    private _authenticator?: Authenticator;
    private _router?: Router;

    /*
     * The entry point logic for the shell application
     */
    public async execute(): Promise<void> {

        try {

            // Set up classes
            await this._initialiseApp();

            if (this._router!.isLoginRequest()) {

                // Handle login requests from other micro UIs
                this._router?.renderLoginRequiredView();

            } else if (this._router!.isLogoutRequest()) {

                // Handle logout requests from other micro UIs
                this._authenticator?.logout();

            } else {

                // Run the page load handler, which may handle a login response and return to a micro UI
                const pageLoadResult = await this._authenticator!.handlePageLoad();
                if (!pageLoadResult.handled) {

                    // Handle other paths that can be navigated to, including the / route
                    if (pageLoadResult.isLoggedIn) {

                        // If already logged in then return to the default application
                        this._router!.redirectToDefaultApplication();

                    } else {

                        // Otherwise render the login required view
                        this._router?.renderLoginRequiredView();
                    }
                }
            }

        } catch (e) {

            // Report failures
            console.log('*** ERROR ***');
            console.log(e);
        }
    }

    /*
     * Initialise the app
     */
    private async _initialiseApp(): Promise<void> {

        // Get the application configuration
        const loader = new ConfigurationLoader();
        this._configuration = await loader.get();

        // Create the authenticator
        const sessionId = SessionManager.get();
        this._authenticator = new Authenticator(this._configuration, sessionId);

        // Create the router
        this._router = new Router(this._configuration, this._authenticator);
    }
}
