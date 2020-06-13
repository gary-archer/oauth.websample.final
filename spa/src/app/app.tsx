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
import {TraceListener} from '../plumbing/oauth/trace/traceListener';
import {CompaniesContainer} from '../views/companies/companiesContainer';
import {ErrorBoundary} from '../views/errors/errorBoundary';
import {ErrorSummaryView} from '../views/errors/errorSummaryView';
import {HeaderButtonsView} from '../views/headings/headerButtonsView';
import {SessionView} from '../views/headings/sessionView';
import {TitleView} from '../views/headings/titleView';
import {LoginRequiredView} from '../views/loginRequired/loginRequiredView';
import {TraceView} from '../views/trace/traceView';
import {TransactionsContainer} from '../views/transactions/transactionsContainer';
import {ViewManager} from '../views/viewManager';
import {AppState} from './appState';

/*
 * The application root component
 */
export class App extends React.Component<any, AppState> {

    private _viewManager: ViewManager;
    private _configuration?: Configuration;
    private _authenticator?: Authenticator;
    private _apiClient?: ApiClient;
    private _traceListener?: TraceListener;

    /*
     * Create safe objects here and do async startup processing later
     */
    public constructor(props: any) {
        super(props);

        // Set initial state, which will be used on the first render
        this.state = {
            isInitialised: false,
            isLoggedIn: false,
            isDataLoaded: false,
            isMobileSize: this._isMobileSize(),
            error: null,
        };

        // Make callbacks available
        this._setupCallbacks();

        // Create a helper class to do multiple view coordination
        this._viewManager = new ViewManager(this._startLoginRedirect, this._onLoadStateChanged);
        this._viewManager.setViewCount(2);

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
            isLoggedIn: false,
            isDataLoaded: false,
            isMobileSize: this._isMobileSize(),
            error: null,
        });

        try {
            // First download configuration from the browser's web domain
            this._configuration = await ConfigurationLoader.download('spa.config.json');

            // Create the authenticator and receive any login responses on the main window
            this._authenticator = this._createAuthenticator();
            await this._authenticator.handleLoginResponse();

            // Create the API client
            this._apiClient = new ApiClient(this._configuration.app.apiBaseUrl, this._authenticator);

            // Initialise OIDC library logging
            this._traceListener = new TraceListener();

            // Subscribe to window events
            window.onhashchange = this._onHashChange;
            window.onresize = this._onResize;

            // Update state
            this.setState({
                isInitialised: true,
                isLoggedIn: await this._authenticator.isLoggedIn(),
            });

        } catch (e) {
            this.setState({error: ErrorHandler.getFromException(e)});
        }
    }

    /*
     * Render basic details before the app has initialised
     */
    private _renderInitialScreen(): React.ReactNode {

        const titleProps = {
            userInfo: null,
        };

        const headerButtonProps = {
            sessionButtonsEnabled: this.state.isDataLoaded,
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
     * Attempt to render the entire layout
     */
    private _renderMain(): React.ReactNode {

        const titleProps = {
            userInfo: {
                apiClient: this._apiClient!,
                viewManager: this._viewManager!,
                shouldLoad: !this._isInLoginRequired(),
            },
        };

        const headerButtonProps = {
            sessionButtonsEnabled: this.state.isDataLoaded,
            handleHomeClick: this._onHome,
            handleExpireAccessTokenClick: this._onExpireAccessToken,
            handleExpireRefreshTokenClick: this._onExpireRefreshToken,
            handleReloadDataClick: this._onReloadData,
            handleLogoutClick: this._onLogout,
        };

        const errorProps = {
            hyperlinkMessage: 'Application Problem Encountered',
            dialogTitle: 'Application Error',
            error: this.state.error,
            centred: true,
        };

        const sessionProps = {
            apiClient: this._apiClient!,
            isVisible: this.state.isLoggedIn,
        };

        const mainViewProps = {
            apiClient: this._apiClient!,
            viewManager: this._viewManager,
            isMobileSize: this.state.isMobileSize,
        };

        // Callbacks to prevent multi line JSX warnings
        const renderCompaniesView     = () =>             <CompaniesContainer {...mainViewProps} />;
        const renderTransactionsView  = (props: any) =>   <TransactionsContainer {...props} {...mainViewProps} />;
        const renderLoginRequiredView = () =>             <LoginRequiredView />;

        // Render the tree view
        return (
            <ErrorBoundary>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...headerButtonProps} />
                <ErrorSummaryView {...errorProps} />
                <SessionView {...sessionProps} />
                <TraceView />
                <HashRouter>
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
     * Create the authenticator object and supply options
     */
    private _createAuthenticator(): Authenticator {

        const postLoginAction = () => {
            this._onReloadData(false);
        };

        return AuthenticatorFactory.createAuthenticator(this._configuration!.oauth, postLoginAction);
    }

    /*
     * Trigger a login redirect when notified by the view manager
     */
    private async _startLoginRedirect(returnLocation?: string): Promise<void> {

        try {
            await this._authenticator!.startLogin(returnLocation);
            this.setState({isLoggedIn: true});

        } catch (e) {

            // Treat cancelled logins as a non error
            const error = ErrorHandler.getFromException(e);
            if (error.errorCode === ErrorCodes.redirectCancelled) {
                location.hash = '#/loggedout';
                return;
            }

            this.setState({error: ErrorHandler.getFromException(e)});
         }
    }

    /*
     * Update session buttons when the main view starts and ends loading
     */
    private _onLoadStateChanged(loaded: boolean): void {
        this.setState({isDataLoaded: loaded});
    }

    /*
     * Handle updates to log levels when the URL log setting is changed
     */
    private _onHashChange(): void {
        this._traceListener!.updateLogLevelIfRequired();
    }

    /*
     * Get updated data from the API
     */
    private _onReloadData(causeError: boolean): void {

        this._viewManager.setViewCount(2);
        EventEmitter.dispatch(EventNames.ON_RELOAD, causeError);
    }

    /*
     * The home button moves to the home view but also deals with error recovery
     */
    private async _onHome(): Promise<void> {

        // If there is a startup error then reinitialise the app
        if (!this.state.isInitialised) {
            await this._initialiseApp();
            return;
        }

        // When in the login required view and home is clicked, force a login redirect
        if (!this._authenticator!.isLoggedIn()) {
            await this._startLoginRedirect('#');
            return;
        }

        // Force views to reload if there have been view errors
        if (!this.state.isDataLoaded) {
            this._onReloadData(false);
        }

        // Navigate to the home view
        location.hash = '#';
    }

    /*
     * Trigger a logout redirect
     */
    private async _onLogout(): Promise<void> {

        try {
            // Update state
            this.setState({isDataLoaded: false});

            // Do the logout redirect
            await this._authenticator!.startLogout();

         } catch (e) {

            // Treat cancelled logouts as a non error
            const error = ErrorHandler.getFromException(e)
            if (error.errorCode === ErrorCodes.redirectCancelled) {
                return;
            }

            // Only output logout errors to the console
            ErrorConsoleReporter.output(error);

            // Ensure that we are in the login required view
            location.hash = '#/loggedout';

         } finally {

            // Move to login required if necessary
            if (!this._isInLoginRequired()) {
                location.hash = '#/loggedout';
            }
            this.setState({isLoggedIn: false});
         }
    }

    /*
     * Return true if our location is the login required view
     */
    private _isInLoginRequired(): boolean {
        return location.hash.indexOf('loggedout') !== -1
    }

    /*
     * For test purposes this makes the access token act expired
     */
    private async _onExpireAccessToken(): Promise<void> {
        await this._authenticator!.expireAccessToken();
    }

    /*
     * For test purposes this makes the refresh token act expired
     */
    private async _onExpireRefreshToken(): Promise<void> {
        await this._authenticator!.expireRefreshToken();
    }

    /*
     * Handle switching between mobile and main views
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
     * Return if the current size is that of a mobile device
     */
    private _isMobileSize(): boolean {
        return window.innerWidth < 768;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._startLoginRedirect = this._startLoginRedirect.bind(this);
        this._onLoadStateChanged = this._onLoadStateChanged.bind(this);
        this._onHashChange = this._onHashChange.bind(this);
        this._onReloadData = this._onReloadData.bind(this);
        this._onHome = this._onHome.bind(this);
        this._onLogout = this._onLogout.bind(this);
        this._onExpireAccessToken = this._onExpireAccessToken.bind(this);
        this._onExpireRefreshToken = this._onExpireRefreshToken.bind(this);
        this._onResize = this._onResize.bind(this);
    }
}
