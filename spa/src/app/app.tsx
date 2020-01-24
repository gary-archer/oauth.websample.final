import React from 'react';
import Modal from 'react-modal';
import {HashRouter, Route, Switch} from 'react-router-dom';
import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {EventEmitter} from '../plumbing/events/eventEmitter';
import {EventNames} from '../plumbing/events/eventNames';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {AuthenticatorFactory} from '../plumbing/oauth/authenticatorFactory';
import {TraceListener} from '../plumbing/oauth/trace/traceListener';
import {CompaniesContainer} from '../views/companies/companiesContainer';
import {ErrorBoundary} from '../views/errors/errorBoundary';
import {ErrorSummaryView} from '../views/errors/errorSummaryView';
import {HeadingView} from '../views/frame/headingView';
import {SessionView} from '../views/frame/sessionView';
import {TitleView} from '../views/frame/titleView';
import {HeaderButtonsView} from '../views/headerButtons/headerButtonsView';
import {LogoutView} from '../views/logout/logoutView';
import {TraceView} from '../views/trace/traceView';
import {TransactionsContainer} from '../views/transactions/transactionsContainer';
import {ViewManager} from '../views/viewManager';
import {AppState} from './appState';

/*
 * The application root component
 */
export class App extends React.Component<any, AppState> {

    private _viewManager: ViewManager;
    private _configuration!: Configuration;
    private _authenticator!: Authenticator;
    private _apiClient!: ApiClient;
    private _traceListener!: TraceListener;

    public constructor(props: any) {
        super(props);

        // Track application state
        this.state = {
            isStarting: true,
            isMainViewLoaded: false,
            applicationError: null,
            isMobileSize: this._isMobileSize(),
        };

        // Make callbacks available
        this._setupCallbacks();

        // Create a helper class to do multiple view coordination and initialise the modal dialog
        this._viewManager = new ViewManager(this._onLoginRequired, this._onLoadStateChanged);
        Modal.setAppElement('#root');
    }

    /*
     * The rendering entry point
     */
    public render(): React.ReactNode {

        if (this.state.isStarting) {

            if (this.state.applicationError) {
                return this._renderStartUpError();
            } else {
                return this._renderInitialScreen();
            }

        } else {

            return this._renderMain();
        }
    }

    /*
     * Do the initial load before the initial render
     */
    public async componentDidMount(): Promise<void> {

        await this._startApp();
    }

    /*
     * Application startup code
     */
    private async _startApp(): Promise<void> {

        try {

            // Reset state during load
            this.setState((prevState) => {
                return {
                    ...prevState,
                    isStarting: true,
                    isMainViewLoaded: false,
                    applicationError: null};
            });

            // Do the work to load the app
            await this._loadApp();

            // Update the load state to force a rerender of the full view
            this.setState((prevState) => {
                return {...prevState, isStarting: false};
            });

        } catch (e) {
            this.setState((prevState) => {
                return {...prevState, applicationError: ErrorHandler.getFromException(e)};
            });
        }
    }

    /*
     * Do the initial creation of global objects before attempting to render the whole view
     */
    private async _loadApp(): Promise<void> {

        // First download configuration from the browser's web domain
        this._configuration = await ConfigurationLoader.download('spa.config.json');

        // Initialise authentication and handle login responses if applicable
        this._authenticator = AuthenticatorFactory.createAuthenticator(this._configuration.oauth);
        await this._authenticator.handleLoginResponse();

        // Create a client to reliably call the API
        this._apiClient = new ApiClient(this._configuration.app.apiBaseUrl, this._authenticator);

        // Initialise OIDC library logging
        this._traceListener = new TraceListener();

        // Subscribe to windows events
        window.onhashchange = this._onHashChange;
        window.onresize = this._onResize;
    }

    /*
     * Attempt to render the entire layout
     */
    private _renderMain(): React.ReactNode {

        const titleProps = {
            userInfo: {
                apiClient: this._apiClient,
                isLoggedOut: this._isLoggedOut(),
                onViewLoaded: this._viewManager.onUserInfoLoaded,
                onViewLoadFailed: this._viewManager.onUserInfoLoadFailed,
            },
        };

        const headerButtonProps = {
            sessionButtonsEnabled: this.state.isMainViewLoaded,
            handleHomeClick: this._handleHomeClick,
            handleExpireAccessTokenClick: this._handleExpireAccessTokenClick,
            handleRefreshDataClick: this._handleRefreshDataClick,
            handleLogoutClick: this._handleLogoutClick,
        };

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered in Application',
            dialogTitle: 'Application Error',
            error: this.state.applicationError,
        };

        const sessionProps = {
            isVisible: !(this.state.isStarting || this._isLoggedOut()),
            apiClient: this._apiClient,
        };

        const mainViewProps = {
            onViewLoading: this._viewManager.onMainViewLoading,
            onViewLoaded: this._viewManager.onMainViewLoaded,
            onViewLoadFailed: this._viewManager.onMainViewLoadFailed,
            apiClient: this._apiClient,
            isMobileSize: this.state.isMobileSize,
        };

        const logoutProps = {
            onViewLoading: this._viewManager.onMainViewLoading,
            onViewLoaded: this._viewManager.onMainViewLoaded,
        };

        // Callbacks to prevent multi line JSX warnings
        const renderCompaniesView    = () =>             <CompaniesContainer {...mainViewProps} />;
        const renderTransactionsView = (props: any) =>   <TransactionsContainer {...props} {...mainViewProps} />;
        const renderLogoutView       = () =>             <LogoutView {...logoutProps} />;

        // Render the tree view
        return (
            <ErrorBoundary>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...headerButtonProps} />
                <ErrorSummaryView {...errorProps} />
                <SessionView {...sessionProps}/>
                <TraceView />
                <HashRouter>
                    <Switch>
                        <Route exact={true} path='/'            render={renderCompaniesView} />
                        <Route exact={true} path='/company=:id' render={renderTransactionsView} />
                        <Route exact={true} path='/loggedout'   render={renderLogoutView} />
                        <Route path='*'                         render={renderCompaniesView} />
                    </Switch>
                </HashRouter>
            </ErrorBoundary>
        );
    }

    /*
     * Render basic details before the app has initialised
     */
    private _renderInitialScreen(): React.ReactNode {

        const titleProps = {
            userInfo: null,
        };

        return (
            <ErrorBoundary>
                <TitleView {...titleProps}/>
                <TraceView />
            </ErrorBoundary>
        );
    }

    /*
     * Render startup errors
     */
    private _renderStartUpError(): React.ReactNode {

        const headerButtonProps = {
            sessionButtonsEnabled: this.state.isMainViewLoaded,
            handleHomeClick: this._handleHomeClick,
            handleExpireAccessTokenClick: this._handleExpireAccessTokenClick,
            handleRefreshDataClick: this._handleRefreshDataClick,
            handleLogoutClick: this._handleLogoutClick,
        };

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered during Application Startup',
            dialogTitle: 'Application Startup Error',
            error: this.state.applicationError,
        };

        return (
            <ErrorBoundary>
                <HeadingView />
                <HeaderButtonsView {...headerButtonProps}/>
                <ErrorSummaryView {...errorProps}/>
                <TraceView />
            </ErrorBoundary>
        );
    }

    /*
     * Trigger a login redirect when notified by the view manager
     */
    private _onLoginRequired() {
        this._authenticator.startLoginRedirect();
    }

    /*
     * Update the load state when notified
     */
    private _onLoadStateChanged(loaded: boolean): void {

        this.setState((prevState) => {
            return {...prevState, isMainViewLoaded: loaded};
        });
    }

    /*
     * Handle updates to log levels when the URL log setting is changed
     */
    private _onHashChange(): void {
        this._traceListener.updateLogLevelIfRequired();
    }

    /*
     * Handle switching between mobile and main views
     */
    private _onResize(): void {

        if (!this.state.isMobileSize && this._isMobileSize()) {

            // Handle changing from a large size to mobile size
            this.setState((prevState) => {
                return {...prevState, isMobileSize: true};
            });

        } else if (this.state.isMobileSize && !this._isMobileSize()) {

            // Handle changing from a mobile size to large size
            this.setState((prevState) => {
                return {...prevState, isMobileSize: false};
            });
        }
    }

    /*
     * Return if the current size is that of a mobile device
     */
    private _isMobileSize(): boolean {
        return window.innerWidth < 768;
    }

    /*
     * Ensure we return to the home location and support retries after errors
     */
    private async _handleHomeClick(): Promise<void> {

        // Update the location
        location.hash = '#';

        // Force a full application restart after an error
        if (this.state.applicationError || this._viewManager.hasError()) {
            await this._startApp();
        }
    }

    /*
     * For test purposes this makes the access token act expired
     */
    private async _handleExpireAccessTokenClick(): Promise<void> {

        await this._authenticator.expireAccessToken();
    }

    /*
     * Get updated data and re-render when refresh is clicked
     * When refresh is long pressed we will intentionally cause an API 500 error
     */
    private async _handleRefreshDataClick(causeError: boolean): Promise<void> {

        EventEmitter.dispatch(EventNames.reload, causeError);
    }

    /*
     * Start a logout redirect
     */
    private async _handleLogoutClick(): Promise<void> {

        try {
            await this._authenticator!.startLogout();

         } catch (e) {

            this.setState((prevState) => {
                return {...prevState, applicationError: ErrorHandler.getFromException(e)};
            });
         }
    }

    /*
     * Calculate whether logged out from the hash URL
     */
    private _isLoggedOut(): boolean {
        return location.hash.indexOf('loggedout') >= 0;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._onLoginRequired = this._onLoginRequired.bind(this);
        this._onLoadStateChanged = this._onLoadStateChanged.bind(this);
        this._onHashChange = this._onHashChange.bind(this);
        this._onResize = this._onResize.bind(this);
        this._handleHomeClick = this._handleHomeClick.bind(this);
        this._handleExpireAccessTokenClick = this._handleExpireAccessTokenClick.bind(this);
        this._handleRefreshDataClick = this._handleRefreshDataClick.bind(this);
        this._handleLogoutClick = this._handleLogoutClick.bind(this);
    }
}
