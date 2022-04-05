import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import {Route, Routes, useNavigate} from 'react-router-dom';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {EventNames} from '../plumbing/events/eventNames';
import {LoginRequiredEvent} from '../plumbing/events/loginRequiredEvent';
import {SetErrorEvent} from '../plumbing/events/setErrorEvent';
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
import {CurrentLocation} from '../views/utilities/currentLocation';
import {AppProps} from './appProps';
import {AppState} from './appState';

/*
 * The application root component
 */
export function App(props: AppProps): JSX.Element {

    // The view is re-rendered when any of these state properties change
    const model = props.viewModel;
    const [state, setState] = useState<AppState>({
        isInitialised: model.isInitialised,
        isMobileLayout: isMobileLayoutNeeded(),
    });

    // Startup runs only once
    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    // Set up React Router navigation
    const navigate = useNavigate();

    /*
     * Run the app's startup logic
     */
    async function startup(): Promise<void> {

        // Initialise the modal dialog system used for error popups
        Modal.setAppElement('#root');

        try {
            // Initialise view models
            await model.initialise();
            setError(null);

            // Ask the authenticator to handle the page load, to return logged in state the UI needs
            const isLoggedIn = await model.authenticator.handlePageLoad(onPostLoginNavigate);
            if (isLoggedIn) {
                HtmlStorageHelper.loggedOut = false;
            }

            // Subscribe to application events
            model.eventBus.on(EventNames.LoginRequired, onLoginRequired);

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

        // Unsubscribe from window events
        window.onresize = null;
        window.onstorage = null;
    }

    /*
     * Trigger a login redirect when all views have finished calling the API and there has been a login_required error
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    async function onLoginRequired(_event: LoginRequiredEvent): Promise<void> {

        try {

            setError(null);
            await model.authenticator.login(CurrentLocation.path);

        } catch (e) {
            setError(e);
        }
    }

    /*
     * After logging in, removed OAuth response details from the browser history
     */
    function onPostLoginNavigate(path: string): void {
        navigate(path, { replace: true} );
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

            if (CurrentLocation.path === '/spa') {

                // Force a reload of the main view if we are already in the home view
                model.reloadMainView();

            } else {

                // Otherwise navigate to the home view
                navigate('/spa');
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

            // Swallow errors and move to the logged out view
            moveToLoggedOutView();
        }

        // Update local storage to inform other tabs to logout
        HtmlStorageHelper.loggedOut = true;
    }

    /*
     * Called when we move to the logged out view manually, such as when there is a logout error
     * This also occurs when there is a logout on another tab and we receive a session storage notification
     */
    function moveToLoggedOutView(): void {
        navigate('/spa/loggedout');
    }

    /*
     * For test purposes this makes the access token in secure cookies act expired
     */
    async function onExpireAccessToken(): Promise<void> {

        try {

            // Try the operation
            await model.authenticator.expireAccessToken();

        } catch (e) {

            // Write technical error details to the console
            const error = ErrorFactory.fromException(e);
            ErrorConsoleReporter.output(error);
        }
    }

    /*
     * For test purposes this makes the refresh token and access token in secure cookies act expired
     */
    async function onExpireRefreshToken(): Promise<void> {

        try {

            // Try the operation
            await model.authenticator.expireRefreshToken();

        } catch (e) {

            // Write technical error details to the console
            const error = ErrorFactory.fromException(e);
            ErrorConsoleReporter.output(error);
        }
    }

    /*
     * Handle switching between mobile and desktop browser sizes
     */
    function onResize(): void {

        // Avoid excessive re-rendering by sending a maximum of one render per 250 milliseconds
        setTimeout(() =>
            setState((s) => {
                return {
                    ...s,
                    isMobileLayout: isMobileLayoutNeeded(),
                };
            }), 250);
    }

    /*
     * Indicate whether the current size is that of a mobile device
     */
    function isMobileLayoutNeeded(): boolean {
        return window.innerWidth < 768;
    }

    /*
     * When there is a logout on another tab, a local storage update is made and we remove tokens stored here
     */
    async function onStorage(event: StorageEvent): Promise<void> {

        if (HtmlStorageHelper.isLoggedOutEvent(event)) {

            await model.authenticator.onLoggedOut();
            moveToLoggedOutView();
        }
    }

    /*
     * A shared subroutine to set error state
     */
    function setError(e: any): void {
        model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('main', e));
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

        const errorBoundaryProps = {
            eventBus: model.eventBus,
        };

        const errorProps = {
            eventBus: model.eventBus,
            containingViewName: 'main',
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'Application Error',
            centred: true,
        };

        return (
            <ErrorBoundary {...errorBoundaryProps}>
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

        const errorBoundaryProps = {
            eventBus: model.eventBus,
        };

        const errorProps = {
            eventBus: model.eventBus,
            containingViewName: 'main',
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'Application Error',
            centred: true,
        };

        const sessionProps = {
            sessionId: SessionManager.get(),
            eventBus: model.eventBus,
        };

        const companiesProps = {
            viewModel: model.getCompaniesViewModel(),
            isMobileLayout: state.isMobileLayout,
        };

        const transactionsProps = {
            viewModel: model.getTransactionsViewModel(),
            navigate,
        };

        const loginRequiredProps = {
            eventBus: model.eventBus,
        };

        // Render the tree view
        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...headerButtonProps} />
                <ErrorSummaryView {...errorProps} />
                <SessionView {...sessionProps} />
                <Routes>
                    <Route path='/spa'               element={<CompaniesContainer {...companiesProps} />} />
                    <Route path='/spa/companies/:id' element={<TransactionsContainer {...transactionsProps} />} />
                    <Route path='/spa/loggedout'     element={<LoginRequiredView {...loginRequiredProps} />} />
                    <Route path='*'                  element={<CompaniesContainer {...companiesProps} />} />
                </Routes>
            </ErrorBoundary>
        );
    }

    if (!state.isInitialised) {
        return renderInitialScreen();
    } else {
        return renderMain();
    }
}
