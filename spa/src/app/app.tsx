import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import {HashRouter, Route, Switch} from 'react-router-dom';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {EventNames} from '../plumbing/events/eventNames';
import {LoginRequiredEvent} from '../plumbing/events/loginRequiredEvent';
import {MobileLoginCompleteEvent} from '../plumbing/events/mobileLoginCompleteEvent';
import {HtmlStorageHelper} from '../plumbing/utilities/htmlStorageHelper';
import {SessionManager} from '../plumbing/utilities/sessionManager';
import {CompaniesContainer} from '../views/companies/companiesContainer';
import {ErrorBoundary} from '../views/errors/errorBoundary';
import {ErrorSummaryView} from '../views/errors/errorSummaryView';
import {HeaderButtonsView} from '../views/headings/headerButtonsView';
import {SessionView} from '../views/headings/sessionView';
import {TitleView} from '../views/headings/titleView';
import {LoginRequiredView} from '../views/loginRequired/loginRequiredView';
import {TransactionsContainer} from '../views/transactions/transactionsContainer';
import {RouteHelper} from '../views/utilities/routeHelper';
import {AppProps} from './appProps';
import {AppState} from './appState';

/*
 * The application root component
 */
export function App(props: AppProps): JSX.Element {

    const model = props.viewModel;
    const [state, setState] = useState<AppState>({
        isInitialised: model.isInitialised,
        isMobileSize: isMobileSize(),
        error: null,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    /*
     * Run the app's startup logic
     */
    async function startup(): Promise<void> {

        // Initialise the modal dialog system used for error popups
        Modal.setAppElement('#root');

        try {
            // Initialise the view model if required
            clearError();
            await model.initialise();

            // Ask the authenticator to handle the page load, to return logged in state the UI needs
            const isLoggedIn = await model.authenticator.handlePageLoad();
            if (isLoggedIn) {
                HtmlStorageHelper.loggedOut = false;
            }

            // Subscribe to application events
            model.eventBus.on(EventNames.LoginRequired, onLoginRequired);
            model.eventBus.on(EventNames.MobileLoginComplete, onMobileLoginComplete);

            // Subscribe to window events
            window.onresize = onResize;
            window.onstorage = onStorage;

            // Update state
            setState((s) => {
                return {
                    ...s,
                    isInitialised: true,
                };
            });

        } catch (e) {
            setError(e);
        }
    }

    /*
     * Cleanup logic
     */
    function cleanup() {

        // Unsubscribe from application events
        model.eventBus.detach(EventNames.LoginRequired, onLoginRequired);
        model.eventBus.detach(EventNames.MobileLoginComplete, onMobileLoginComplete);

        // Unsubscribe from window events
        window.onresize = null;
        window.onstorage = null;
    }

    /*
     * Trigger a login redirect when all views have finished calling the API and there has been a login_required error
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    async function onLoginRequired(event: LoginRequiredEvent): Promise<void> {
    /* eslint-enable @typescript-eslint/no-unused-vars */

        try {

            // Ask the authenticator to do the login redirect
            clearError();
            await model.authenticator.login();

            // When running in a mobile web view we may still be in the login required view, in which case move home
            if (RouteHelper.isInLoggedOutView()) {
                location.hash = '#';
            }

        } catch (e) {

            // Treat cancelled logins as a non error, when running in a mobile web view
            const error = ErrorHandler.getFromException(e);
            if (error.errorCode === ErrorCodes.redirectCancelled) {
                location.hash = '#loggedout';
                return;
            }

            setError(error);
        }
    }

    /*
     * Called after an AppAuth login completes successfully when the SPA is running in a mobile web view
     * In this scenario the SPA needs to be told to reload itself when the InApp browser closes
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    function onMobileLoginComplete(event: MobileLoginCompleteEvent): void {
    /* eslint-enable @typescript-eslint/no-unused-vars */

        model.reloadData(false);
    }

    /*
     * Return home and force a reload of data
     */
    async function onHome(): Promise<void> {

        // If there is a startup error then reinitialise the app when home is pressed
        if (!state.isInitialised) {
            cleanup();
            await startup();
        }

        if (state.isInitialised) {

            if (RouteHelper.isInHomeView()) {

                // Force a reload of the main view if we are already in the home view
                model.reloadMainView();

            } else {

                // Otherwise navigate to the home view
                location.hash = '#';
            }
        }
    }

    /*
     * Trigger a logout redirect
     */
    async function onLogout(): Promise<void> {

        try {

            // Start the logout redirect
            await model.authenticator.logout();

        } catch (e) {

            // Treat cancelled logouts as a non error, when running in a mobile web view
            const error = ErrorHandler.getFromException(e);
            if (error.errorCode !== ErrorCodes.redirectCancelled) {

                // Write logout technical error details to the console
                ErrorConsoleReporter.output(error);
            }

            // Move to the logged out view anyway
            moveToLoggedOutView();
        }

        // Update local storage to inform other tabs to logout
        HtmlStorageHelper.loggedOut = true;
    }

    /*
     * Called when we move to the logged out view manually, such as when there is a logout error
     * This also occurs when there is a logout on another tab and we receive a check session iframe notification
     */
    function moveToLoggedOutView(): void {
        location.hash = '#loggedout';
    }

    /*
     * For test purposes this makes the access token in secure cookies act expired
     */
    async function onExpireAccessToken(): Promise<void> {

        try {
            clearError();
            await model.authenticator.expireAccessToken();

        } catch (e) {
            setError(e);
        }
    }

    /*
     * For test purposes this makes the refresh token and access token in secure cookies act expired
     */
    async function onExpireRefreshToken(): Promise<void> {

        try {
            clearError();
            await model.authenticator.expireRefreshToken();

        } catch (e) {
            setError(e);
        }
    }

    /*
     * Handle switching between mobile and main view sizes
     */
    function onResize(): void {

        if (!state.isMobileSize && isMobileSize()) {

            // Handle changing from a large size to mobile size
            setState((s) => {
                return {
                    ...s,
                    isMobileSize: true,
                };
            });

        } else if (state.isMobileSize && !isMobileSize()) {

            // Handle changing from a mobile size to large size
            setState((s) => {
                return {
                    ...s,
                    isMobileSize: false,
                };
            });
        }
    }

    /*
     * When there is a logout on another tab, a local storage update is made and we remove tokens stored here
     * This event does not seem to fire in the deployed system for the Safari browser but works locally
     * https://www.py4u.net/discuss/317247
     */
    async function onStorage(event: StorageEvent): Promise<void> {

        if (HtmlStorageHelper.isLoggedOutEvent(event)) {

            await model.authenticator.onLoggedOut();
            moveToLoggedOutView();
        }
    }

    /*
     * Indicate whether the current size is that of a mobile device
     */
    function isMobileSize(): boolean {
        return window.innerWidth < 768;
    }

    /*
     * A shared subroutine to set error state
     */
    function setError(e: any): void {

        setState((s) => {
            return {
                ...s,
                error: ErrorHandler.getFromException(e),
            };
        });
    }

    /*
     * A shared subroutine to clear error state
     */
    function clearError(): void {
        
        if (state.error) {

            setState((s) => {
                return {
                    ...s,
                    error: null,
                };
            });
        }
    }

    /*
     * Render basic details before the view model has initialised
     */
    function renderInitialScreen(): JSX.Element {

        const titleProps = {
            userInfo: null,
        };

        const headerButtonProps = {
            eventBus: model.eventBus,
            handleHomeClick: onHome,
            handleExpireAccessTokenClick: onExpireAccessToken,
            handleExpireRefreshTokenClick: onExpireRefreshToken,
            handleReloadDataClick: model.reloadData,
            handleLogoutClick: onLogout,
        };

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'Application Error',
            error: state.error,
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
    function renderMain(): JSX.Element {

        const titleProps = {
            userInfo: {
                viewModel: model.getUserInfoViewModel(),
            },
        };

        const headerButtonProps = {
            eventBus: model.eventBus,
            handleHomeClick: onHome,
            handleExpireAccessTokenClick: onExpireAccessToken,
            handleExpireRefreshTokenClick: onExpireRefreshToken,
            handleReloadDataClick: model.reloadData,
            handleLogoutClick: onLogout,
        };

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'Application Error',
            error: state.error,
            centred: true,
        };

        const sessionProps = {
            sessionId: SessionManager.get(),
            eventBus: model.eventBus,
        };

        const companiesViewProps = {
            viewModel: model.getCompaniesViewModel(),
            isMobileSize: state.isMobileSize,
        };

        const transactionsViewProps = {
            viewModel: model.getTransactionsViewModel(),
            isMobileSize: state.isMobileSize,
        };

        const loginRequiredProps = {
            eventBus: model.eventBus,
        };

        // Callbacks to prevent multi line JSX warnings
        const renderCompaniesView = () =>
            <CompaniesContainer {...companiesViewProps} />;

        const renderTransactionsView = (routeProps: any) =>
            <TransactionsContainer {...routeProps} {...transactionsViewProps} />;

        const renderLoginRequiredView = () =>
            <LoginRequiredView {...loginRequiredProps} />;

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

    if (!state.isInitialised) {
        return renderInitialScreen();
    } else {
        return renderMain();
    }
}
