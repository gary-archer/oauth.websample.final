import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import {Route, Routes, useNavigate} from 'react-router-dom';
import {EventNames} from '../plumbing/events/eventNames';
import {LoginRequiredEvent} from '../plumbing/events/loginRequiredEvent';
import {HtmlStorageHelper} from '../plumbing/utilities/htmlStorageHelper';
import {SessionManager} from '../plumbing/utilities/sessionManager';
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

        // Subscribe to application and window events
        model.eventBus.on(EventNames.LoginRequired, onLoginRequired);
        window.onresize = onResize;
        window.onstorage = onStorage;

        // Initialize the main view model the first time
        const navigateTo = await model.initialise();

        // Report any errors
        setState((s) => {
            return {
                ...s,
                error: model.error,
            };
        });

        // Navigate back to prelogin locations if applicable
        if (navigateTo) {
            navigate(navigateTo, { replace: true});
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
    async function onLoginRequired(_event: LoginRequiredEvent): Promise<void> {

        await model.login(CurrentLocation.path);
        setState((s) => {
            return {
                ...s,
                error: model.error,
            };
        });
    }

    /*
     * Manage navigating home
     */
    async function onHome(): Promise<void> {

        // If there is a startup error then reinitialise the app when home is pressed
        if (!model.isLoaded) {
            await model.initialise();
        }

        if (model.isLoaded) {

            // Navigate home
            navigate('/');

            // Trigger a reload if recovering from errors
            model.reloadDataOnError();
        }
    }

    /*
     * Whenb logout is selected, redirect to the shell app, which will implement the logout details
     */
    async function onLogout(): Promise<void> {
        await model.logout();
    }

    /*
     * For test purposes this makes the access token in secure cookies act expired
     */
    async function onExpireAccessToken(): Promise<void> {

        await model.expireAccessToken();
        setState((s) => {
            return {
                ...s,
                error: model.error,
            };
        });
    }

    /*
     * For test purposes this makes the refresh token and access token in secure cookies act expired
     */
    async function onExpireRefreshToken(): Promise<void> {

        await model.expireRefreshToken();
        setState((s) => {
            return {
                ...s,
                error: model.error,
            };
        });
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
            dialogTitle: 'SPA Error',
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
                {state.error && <ErrorSummaryView {...getErrorProps()} />}
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
                {state.error && <ErrorSummaryView {...getErrorProps()} />}
                <SessionView {...sessionProps} />
                <Routes>
                    <Route path='/companies/:id' element={<TransactionsContainer {...transactionsProps} />} />
                    <Route path='/*'             element={<CompaniesContainer {...companiesProps} />} />
                </Routes>
            </>
        );
    }

    if (!model.isLoaded) {
        return renderInitialScreen();
    } else {
        return renderMain();
    }
}
