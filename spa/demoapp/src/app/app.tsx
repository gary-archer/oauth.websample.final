import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import {Route, Routes, useNavigate} from 'react-router-dom';
import {BaseErrorFactory, ErrorConsoleReporter} from '../plumbing/errors/lib';
import {EventNames} from '../plumbing/events/eventNames';
import {LoginRequiredEvent} from '../plumbing/events/loginRequiredEvent';
import {HtmlStorageHelper} from '../plumbing/utilities/htmlStorageHelper';
import {SessionManager} from '../plumbing/utilities/sessionManager';
import {CallbackView} from '../views/callback/callbackView';
import {CompaniesContainer} from '../views/companies/companiesContainer';
import {ErrorSummaryView} from '../views/errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../views/errors/errorSummaryViewProps';
import {HeaderButtonsView} from '../views/headings/headerButtonsView';
import {HeaderButtonsViewProps} from '../views/headings/headerButtonsViewProps';
import {SessionView} from '../views/headings/sessionView';
import {TitleView} from '../views/headings/titleView';
import {TransactionsContainer} from '../views/transactions/transactionsContainer';
import {CurrentLocation} from '../views/utilities/currentLocation';
import {AppProps} from './appProps';
import {AppState} from './appState';

/*
 * The application root component
 */
export function App(props: AppProps): JSX.Element {

    // Get global data whenever the view is recreated
    const model = props.viewModel;

    // The view is re-rendered when any of these state properties change
    const [state, setState] = useState<AppState>({
        isInitialised: model.isInitialised,
        isMobileLayout: isMobileLayoutNeeded(),
        error: null,
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
            state.error = null;

            // Subscribe to application and window events
            model.eventBus.on(EventNames.LoginRequired, onLoginRequired);
            window.onresize = onResize;
            window.onstorage = onStorage;

            // Update state
            setState((s) => {
                return {
                    ...s,
                    isInitialised: true,
                };
            });

        } catch (e: any) {

            // Render startup errors
            state.error = BaseErrorFactory.fromException(e);
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
     * Trigger a login redirect when refresh tokens have expired and all API calls fail
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    function onLoginRequired(_event: LoginRequiredEvent): void {
        model.authenticator.login();
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

            if (CurrentLocation.path === '/') {

                // Force a reload of the main view if we are already in the home view
                model.reloadMainView();

            } else {

                // Otherwise navigate home
                navigate('/');
            }

            // Also reload user info if we are recovering from an error
            if (model.apiViewEvents.hasLoadError()) {
                model.reloadUserInfo();
            }
        }
    }

    /*
     * Whenb logout is selected, redirect to the shell app, which will implement the logout details
     */
    function onLogout(): void {
        model.authenticator.logout();
    }

    /*
     * For test purposes this makes the access token in secure cookies act expired
     */
    async function onExpireAccessToken(): Promise<void> {

        try {

            // Try the operation
            await model.authenticator.expireAccessToken();

        } catch (e: any) {

            // Write technical error details to the console
            const error = BaseErrorFactory.fromException(e);
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

        } catch (e: any) {

            // Write technical error details to the console
            const error = BaseErrorFactory.fromException(e);
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
     * When there is a logout on another tab, a local storage update is made and we move to the login screen
     */
    async function onStorage(event: StorageEvent): Promise<void> {

        if (HtmlStorageHelper.isLoggedOutEvent(event)) {
            await model.authenticator.onLoggedOut();
        }
    }

    /*
     * Return the header props
     */
    function getErrorProps(): ErrorSummaryViewProps {

        return {
            error: state.error!,
            errorsToIgnore: [],
            containingViewName: 'main',
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'Demo Application Error',
            centred: true,
        };
    }

    /*
     * Return header button props
     */
    function getHeaderButtonProps(): HeaderButtonsViewProps {

        return {
            eventBus: model.eventBus,
            handleHomeClick: onHome,
            handleExpireAccessTokenClick: onExpireAccessToken,
            handleExpireRefreshTokenClick: onExpireRefreshToken,
            handleReloadDataClick: model.reloadData,
            handleLogoutClick: onLogout,
        };
    }

    /*
     * Render basic details before the view model has initialised
     */
    function renderInitialScreen(): JSX.Element {

        const titleProps = {
            userInfo: null,
        };

        return (
            <>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...getHeaderButtonProps()} />
                <ErrorSummaryView {...getErrorProps()} />
            </>
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

        const sessionProps = {
            sessionId: SessionManager.get(),
            eventBus: model.eventBus,
        };

        const callbackProps = {
            navigate,
        };

        const companiesProps = {
            viewModel: model.getCompaniesViewModel(),
            isMobileLayout: state.isMobileLayout,
        };

        const transactionsProps = {
            viewModel: model.getTransactionsViewModel(),
            navigate,
        };

        // Render the tree view
        return (
            <>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...getHeaderButtonProps()} />
                <ErrorSummaryView {...getErrorProps()} />
                <SessionView {...sessionProps} />
                <Routes>
                    <Route path='/callback'      element={<CallbackView {...callbackProps} />} />
                    <Route path='/companies/:id' element={<TransactionsContainer {...transactionsProps} />} />
                    <Route path='/*'             element={<CompaniesContainer {...companiesProps} />} />
                </Routes>
            </>
        );
    }

    if (!state.isInitialised) {
        return renderInitialScreen();
    } else {
        return renderMain();
    }
}
