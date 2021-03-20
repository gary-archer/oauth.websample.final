import React from 'react';
import Modal from 'react-modal';
import {HashRouter, Route, Switch} from 'react-router-dom';
import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {EventEmitter} from '../plumbing/events/eventEmitter';
import {EventNames} from '../plumbing/events/eventNames';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {AuthenticatorFactory} from '../plumbing/oauth/authenticatorFactory';
import {CompaniesContainer} from '../views/companies/companiesContainer';
import {ErrorBoundary} from '../views/errors/errorBoundary';
import {ErrorSummaryView} from '../views/errors/errorSummaryView';
import {HeaderButtonsView} from '../views/headings/headerButtonsView';
import {SessionView} from '../views/headings/sessionView';
import {TitleView} from '../views/headings/titleView';
import {LoginRequiredView} from '../views/loginRequired/loginRequiredView';
import {TransactionsContainer} from '../views/transactions/transactionsContainer';
import {ApiViewEvents} from '../views/utilities/apiViewEvents';
import {ApiViewNames} from '../views/utilities/apiViewNames';
import {RouteHelper} from '../views/utilities/routeHelper';
import {AppState} from './appState';

/*
 * The application root component
 */
export class App extends React.Component<any, AppState> {

    private readonly _apiViewEvents: ApiViewEvents;
    private _configuration?: Configuration;
    private _authenticator?: Authenticator;
    private _apiClient?: ApiClient;

    /*
     * Create safe objects here and do async startup processing later
     */
    public constructor(props: any) {
        super(props);

        // Set initial state, which will be used on the first render
        this.state = {
            isInitialised: false,
            isInLoggedOutView: false,
            isMainViewLoaded: false,
            isMobileSize: this._isMobileSize(),
            error: null,
        };

        // Make callbacks available
        this._setupCallbacks();

        // Create a helper class to notify us about views that make API calls
        // This will enable us to only trigger a login redirect once, after all views have tried to load
        this._apiViewEvents = new ApiViewEvents(this._onLoginRequired, this._onMainViewLoadStateChanged);
        this._apiViewEvents.addView(ApiViewNames.Main);
        this._apiViewEvents.addView(ApiViewNames.UserInfo);

        // Initialise the modal dialog system used for error popups
        Modal.setAppElement('#root');
    }

    /*
     * The rendering entry point
     */
    public render(): React.ReactNode {

        if (!this.state.isInitialised) {
            return this._renderInitialScreen();
        } else {
            return this._renderMain();
        }
    }

    /*
     * Page startup logic
     */
    public async componentDidMount(): Promise<void> {
        await this._initialiseApp();
    }

    /*
     * Application startup code
     */
    private async _initialiseApp(): Promise<void> {

        // Reset state
        this.setState({
            isInitialised: false,
            isInLoggedOutView: false,
            isMainViewLoaded: false,
            isMobileSize: this._isMobileSize(),
            error: null,
        });

        try {
            // First download configuration from the browser's web domain
            const loader = new ConfigurationLoader();
            this._configuration = await loader.download();

            // Create the authenticator and receive any login responses on the main window
            this._authenticator = this._createAuthenticator();
            await this._authenticator.initialise();
            await this._authenticator.handleLoginResponse();

            // Create the API client
            this._apiClient = new ApiClient(this._configuration.app.apiBaseUrl, this._authenticator);

            // Subscribe to window events
            window.onhashchange = this._onHashChange;
            window.onresize = this._onResize;

            // Update state
            this.setState({isInitialised: true});

        } catch (e) {
            this.setState({error: ErrorHandler.getFromException(e)});
        }
    }

    /*
     * Render basic details before the app has processed its configuration
     */
    private _renderInitialScreen(): React.ReactNode {

        const titleProps = {
            userInfo: null,
        };

        const headerButtonProps = {
            usesRefreshTokens: this._showRefreshTokenOptions(),
            sessionButtonsEnabled: this.state.isMainViewLoaded && !this.state.isInLoggedOutView,
            handleHomeClick: this._onHome,
            handleReloadDataClick: this._onReloadData,
            handleExpireAccessTokenClick: this._onExpireAccessToken,
            handleExpireRefreshTokenClick: this._onExpireRefreshToken,
            handleLogoutClick: this._onLogout,
        };

        const errorProps = {
            hyperlinkMessage: 'Startup Problem Encountered',
            dialogTitle: 'Startup Error',
            error: this.state.error,
            centred: true,
        };

        return (
            <ErrorBoundary>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...headerButtonProps} />
                <ErrorSummaryView {...errorProps} />
            </ErrorBoundary>
        );
    }

    /*
     * Attempt to render the entire layout, which will trigger calls to Web APIs
     */
    private _renderMain(): React.ReactNode {

        const titleProps = {
            userInfo: {
                apiClient: this._apiClient!,
                events: this._apiViewEvents,
                shouldLoad: !this.state.isInLoggedOutView,
            },
        };

        const headerButtonProps = {
            usesRefreshTokens: this._showRefreshTokenOptions(),
            sessionButtonsEnabled: this.state.isMainViewLoaded && !this.state.isInLoggedOutView,
            handleHomeClick: this._onHome,
            handleExpireAccessTokenClick: this._onExpireAccessToken,
            handleExpireRefreshTokenClick: this._onExpireRefreshToken,
            handleReloadDataClick: this._onReloadData,
            handleLogoutClick: this._onLogout,
        };

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'Application Error',
            error: this.state.error,
            centred: true,
        };

        const sessionProps = {
            apiClient: this._apiClient!,
            isVisible: !this.state.isInLoggedOutView,
        };

        const mainViewProps = {
            onLoading: this._onMainViewLoading,
            apiClient: this._apiClient!,
            events: this._apiViewEvents,
            isMobileSize: this.state.isMobileSize,
        };

        const loginRequiredProps = {
            onLoading: this._onLoggedOutViewLoading,
        };

        // Callbacks to prevent multi line JSX warnings
        const renderCompaniesView     = () =>             <CompaniesContainer {...mainViewProps} />;
        const renderTransactionsView  = (props: any) =>   <TransactionsContainer {...props} {...mainViewProps} />;
        const renderLoginRequiredView = () =>             <LoginRequiredView {...loginRequiredProps} />;

        // Render the tree view
        return (
            <ErrorBoundary>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...headerButtonProps} />
                <ErrorSummaryView {...errorProps} />
                <SessionView {...sessionProps} />
                <HashRouter hashType='noslash'>
                    <Switch>
                        <Route exact={true} path='/'            render={renderCompaniesView} />
                        <Route exact={true} path='/company=:id' render={renderTransactionsView} />
                        <Route exact={true} path='/loggedout'   render={renderLoginRequiredView} />
                        <Route path='*'                         render={renderCompaniesView} />
                    </Switch>
                </HashRouter>
            </ErrorBoundary>
        );
    }

    /*
     * Create the authenticator object from our configuration, and supply callbacks
     */
    private _createAuthenticator(): Authenticator {

        return AuthenticatorFactory.createAuthenticator(
            this._configuration!.oauth,
            this._configuration!.app.webBaseUrl,
            this._onMobileWebViewLogin,
            this._onMoveToLoggedOutView);
    }

    /*
     * Trigger a login redirect when all views have finished calling the API and there has been a login_required error
     */
    private async _onLoginRequired(): Promise<void> {

        try {

            // Do the login redirect via the authenticator class
            this.setState({error: null});
            await this._authenticator!.login();

            // When running in a mobile web view we may still be in the login required view, in which case move home
            if (this.state.isInLoggedOutView) {
                location.hash = '#';
            }

        } catch (e) {

            // Treat cancelled logins as a non error, when running in a mobile web view
            const error = ErrorHandler.getFromException(e);
            if (error.errorCode === ErrorCodes.redirectCancelled) {
                location.hash = '#loggedout';
                return;
            }

            this.setState({error: ErrorHandler.getFromException(e)});
        }
    }

    /*
     * Called after login completes successfully when running in a mobile web view
     */
    private _onMobileWebViewLogin(): void {
        this._onReloadData(false);
    }

    /*
     * Update state when the companies or transactions view loads
     */
    private _onMainViewLoading(): void {
        this.setState({isInLoggedOutView: false});
    }

    /*
     * Update state when the logged out view loads
     */
    private _onLoggedOutViewLoading(): void {
        this.setState({isInLoggedOutView: true});
    }

    /*
     * Update session buttons when the main view starts and ends loading
     */
    private _onMainViewLoadStateChanged(loaded: boolean): void {
        this.setState({isMainViewLoaded: loaded});
    }

    /*
     * Handle updates to log levels when the URL log setting is changed
     */
    private _onHashChange(): void {
        this._authenticator!.updateLogLevelIfRequired();
    }

    /*
     * Ask all views to get updated data from the API
     */
    private _onReloadData(causeError: boolean): void {

        this._apiViewEvents.clearState();
        EventEmitter.dispatch(EventNames.ON_RELOAD_MAIN, causeError);
        EventEmitter.dispatch(EventNames.ON_RELOAD_USERINFO, causeError);
    }

    /*
     * Return home and force a reload of data
     */
    private async _onHome(): Promise<void> {

        // If there is a startup error then reinitialise the app
        if (!this.state.isInitialised) {
            await this._initialiseApp();
        }

        if (this.state.isInitialised) {

            if (RouteHelper.isInHomeView()) {

                // Force a reload of the main view if we are already in the home view
                EventEmitter.dispatch(EventNames.ON_RELOAD_MAIN, false);

            } else {

                // Otherwise navigate to the home view
                location.hash = '#';
            }
        }
    }

    /*
     * Trigger a logout redirect
     */
    private async _onLogout(): Promise<void> {

        try {

            // Update state
            this.setState({isMainViewLoaded: false});

            // Start the logout redirect, which will return to the app in the login required page
            await this._authenticator!.logout();

        } catch (e) {

            // Treat cancelled logouts as a non error, when running in a mobile web view
            const error = ErrorHandler.getFromException(e);
            if (error.errorCode !== ErrorCodes.redirectCancelled) {

                // Otherwise output logout error details only to the console
                ErrorConsoleReporter.output(error);
            }
        } finally {

            // Ensure that we are in the logged out view in all cases
            this._onMoveToLoggedOutView();
        }
    }

    /*
     * Called when we move to the logged out view manually, such as when there is a logout error
     * This also occurs when there is a logout on another tab and we receive a check session iframe notification
     */
    private _onMoveToLoggedOutView(): void {
        location.hash = '#loggedout';
    }

    /*
     * For test purposes this makes the access token act expired
     */
    private async _onExpireAccessToken(): Promise<void> {
        await this._authenticator!.expireAccessToken();
    }

    /*
     * Return false if configuration has not loaded or the system is not using a web reverse proxy
     * Token refresh is then done via the standard SSO cookie and we hide the 'Expire Refresh Token button
     */ 
    private _showRefreshTokenOptions(): boolean {

        if (!this._configuration || !this._configuration?.oauth.reverseProxyPath) {
            return false;
        }

        return true;
    }

    /*
     * For test purposes this makes the refresh token act expired
     */
    private async _onExpireRefreshToken(): Promise<void> {

        try {

            // Where applicable, make the refresh token act expired
            this.setState({error: null});
            await this._authenticator!.expireRefreshToken();

        } catch (e) {

            // Report errors
            this.setState({error: ErrorHandler.getFromException(e)});
        }
    }

    /*
     * Handle switching between mobile and main view sizes
     */
    private _onResize(): void {

        if (!this.state.isMobileSize && this._isMobileSize()) {

            // Handle changing from a large size to mobile size
            this.setState({isMobileSize: true});

        } else if (this.state.isMobileSize && !this._isMobileSize()) {

            // Handle changing from a mobile size to large size
            this.setState({isMobileSize: false});
        }
    }

    /*
     * Indicate whether the current size is that of a mobile device
     */
    private _isMobileSize(): boolean {
        return window.innerWidth < 768;
    }

    /*
     * Plumbing to ensure that the this parameter is available in callback functions
     */
    private _setupCallbacks(): void {
        this._onMainViewLoading = this._onMainViewLoading.bind(this);
        this._onLoggedOutViewLoading = this._onLoggedOutViewLoading.bind(this);
        this._onMainViewLoadStateChanged = this._onMainViewLoadStateChanged.bind(this);
        this._onHashChange = this._onHashChange.bind(this);
        this._onHome = this._onHome.bind(this);
        this._onLoginRequired = this._onLoginRequired.bind(this);
        this._onReloadData = this._onReloadData.bind(this);
        this._onMobileWebViewLogin = this._onMobileWebViewLogin.bind(this);
        this._onLogout = this._onLogout.bind(this);
        this._onMoveToLoggedOutView = this._onMoveToLoggedOutView.bind(this);
        this._onExpireAccessToken = this._onExpireAccessToken.bind(this);
        this._onExpireRefreshToken = this._onExpireRefreshToken.bind(this);
        this._onResize = this._onResize.bind(this);
    }
}
