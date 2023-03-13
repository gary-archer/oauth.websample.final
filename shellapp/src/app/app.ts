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

            // Requests to move to the login screen
            if (this._router!.isLoginRequest()) {
                this._router?.renderLoginRequiredView(false);
                return;
            }

            // Requests to move to the logged out screen
            if (this._router!.isLoggedOutRequest()) {
                this._router?.renderLoginRequiredView(true);
                return;
            }

            // Run the page load handler, which may handle a login response and return to the calling app
            const pageLoadResult = await this._authenticator!.handlePageLoad();
            if (pageLoadResult.handled) {
                return;
            }

            // Execute a logout if requested
            if (this._router!.isLogoutRequest()) {
                await this._authenticator?.logout();
                return;
            }

            // Handle other paths navigated to
            if (pageLoadResult.isLoggedIn) {
                this._router!.redirectToDefaultApplication();

            } else {
                this._router?.renderLoginRequiredView(false);
            }

        } catch (e) {

            // Report failures
            console.log('*** MAIN ERROR ***');
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

    /*
     * Try a logout and swallow errors, since the user cannot recover
     */
    private async _runLogout(): Promise<void> {

        try {
            await this._authenticator?.logout();

        } catch(e: any) {

            console.log('*** LOGOUT ERROR ***');
            console.log(e);
            this._router?.renderLoginRequiredView(true);
        }
    }
}
