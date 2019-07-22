import * as $ from 'jquery';
import {Configuration} from './configuration/configuration';
import {HttpClient} from './plumbing/api/httpClient';
import {UIError} from './plumbing/errors/uiError';
import {Authenticator} from './plumbing/oauth/authenticator';
import {ErrorFragment} from './views/errorFragment';
import {Router} from './views/router';
import {TraceFragment} from './views/traceFragment';

/*
 * The application class
 */
class App {

    /*
     * The app uses a global instance of OIDC Client and a global router class
     */
    private _authenticator!: Authenticator;
    private _router!: Router;
    private _configuration?: Configuration;

    /*
     * Class setup
     */
    public constructor() {

        (window as any).$ = $;
        this._setupCallbacks();
    }

    /*
     * The entry point for the SPA
     */
    public async execute(): Promise<void> {

        // Set initial state
        $('.initiallydisabled').prop('disabled', true);

        // Set up click handlers
        $('#btnHome').click(this._onHome);
        $('#btnRefreshData').click(this._onRefreshData);
        $('#btnExpireAccessToken').click(this._onExpireToken);
        $('#btnLogout').click(this._onLogout);
        $('#btnClearError').click(this._onClearError);
        $('#btnClearTrace').click(this._onClearTrace);

        try {

            // Start listening for hash changes once the page has been initially loaded
            $(window).on('hashchange', this._onHashChange);

            // Download configuration
            this._configuration = await this._downloadSpaConfig();

            // Do one time app initialisation
            this._initialiseApp();

            // We must be prepared for page invocation to be an OAuth login response
            const runPage = await this._handleLoginResponse();
            if (runPage) {

                // Get claims from our API to display the logged in user
                await this._getUserClaims();

                // Execute the main view at the current hash location
                await this._runPage();
            }

        } catch (e) {

            // Render the error view if there are problems
            this._getErrorView().execute(e);
        }
    }

    /*
     * Download application configuration
     */
    private async _downloadSpaConfig(): Promise<Configuration> {
        return await HttpClient.loadAppConfiguration('spa.config.json');
    }

    /*
     * Initialise the app
     */
    private _initialiseApp(): void {

        // Initialise our OIDC Client wrapper
        this._authenticator = new Authenticator(this._configuration!.oauth, this._onBackgroundError);

        // Set up OIDC Client logging
        TraceFragment.initialize();

        // Our simple router passes the OIDC Client instance between views
        this._router = new Router(this._configuration!.app, this._authenticator);
    }

    /*
     * Handle login responses on page load so that we have tokens and can call APIs
     */
    private async _handleLoginResponse(): Promise<boolean> {
        return await this._authenticator.handleLoginResponse();
    }

    /*
     * Get and display user claims from the API, which can contain any data we need, not just token data
     */
    private async _getUserClaims(): Promise<void> {
        await this._router.executeUserInfoFragment();
    }

    /*
     * Once login processing has completed, start listening for hash changes
     */
    private async _runPage(): Promise<void> {
        await this._router!.executeView();
    }

    /*
     * Change the view based on the hash URL and catch errors
     */
    private async _onHashChange(): Promise<void> {

        TraceFragment.updateLevelIfRequired();

        try {
            // Try to change view
            await this._router.executeView();

        } catch (e) {

            // Report failures
            this._getErrorView().execute(e);
        }
    }

    /*
     * This forces the On Home button to always do a reload of the current view after errors
     */
    private _onHome(): void {

        if (!this._router) {

            // If we don't have a router yet, reload the whole page
            location.reload();
        } else {

            // Otherwise update the hash location
            this._router.moveHome();
        }
    }

    /*
     * Force data reload
     */
    private async _onRefreshData(): Promise<void> {
        try {
            // Try to reload data
            await this._router.executeView();

        } catch (e) {

            // Report failures
            this._getErrorView().execute(e);
        }
    }

    /*
     * Force a new access token to be retrieved
     */
    private async _onExpireToken(): Promise<void> {
        await this._authenticator!.expireAccessToken();
    }

    /*
     * Start a logout request
     */
    private async _onLogout(): Promise<void> {

        try {

           // Start the logout redirect
           await this._authenticator!.startLogout();

        } catch (e) {

            // Report failures
            this._getErrorView().execute(e);
        }
    }

    /*
     * Report background errors during silent token renewal
     */
    private _onBackgroundError(e: UIError): void {
        const errorView = new ErrorFragment(this._configuration!.app);
        errorView.execute(e);
    }

    /*
     * Clear error output
     */
    private _onClearError(): void {
        const errorView = new ErrorFragment(this._configuration!.app);
        errorView.clear();
    }

    /*
     * Get the error view
     */
    private _getErrorView(): ErrorFragment {
        return new ErrorFragment(this._configuration ? this._configuration!.app : undefined);
    }

    /*
     * Clear trace output
     */
    private _onClearTrace(): void {
        TraceFragment.clear();
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._initialiseApp = this._initialiseApp.bind(this);
        this._handleLoginResponse = this._handleLoginResponse.bind(this);
        this._getUserClaims = this._getUserClaims.bind(this);
        this._runPage = this._runPage.bind(this);
        this._onHashChange = this._onHashChange.bind(this);
        this._onHome = this._onHome.bind(this);
        this._onClearError = this._onClearError.bind(this);
        this._onRefreshData = this._onRefreshData.bind(this);
        this._onExpireToken = this._onExpireToken.bind(this);
        this._onLogout = this._onLogout.bind(this);
        this._onBackgroundError = this._onBackgroundError.bind(this);
   }
}

/*
 * Run the application
 */
const app = new App();
app.execute();
