import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import {Route, Routes, useNavigate} from 'react-router-dom';
import {EventNames} from '../plumbing/events/eventNames';
import {LoginRequiredEvent} from '../plumbing/events/loginRequiredEvent';
import {HtmlStorageHelper} from '../plumbing/utilities/htmlStorageHelper';
import {SessionManager} from '../plumbing/utilities/sessionManager';
import {CompaniesContainer} from '../views/companies/companiesContainer';
import {CompaniesContainerProps} from '../views/companies/companiesContainerProps';
import {ErrorSummaryView} from '../views/errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../views/errors/errorSummaryViewProps';
import {HeaderButtonsView} from '../views/headings/headerButtonsView';
import {HeaderButtonsViewProps} from '../views/headings/headerButtonsViewProps';
import {LoginRequiredViewProps} from '../views/loginRequired/loginRequiredViewProps';
import {SessionView} from '../views/headings/sessionView';
import {SessionViewProps} from '../views/headings/sessionViewProps';
import {TitleView} from '../views/headings/titleView';
import {LoginRequiredView} from '../views/loginRequired/loginRequiredView';
import {TitleViewProps} from '../views/headings/titleViewProps';
import {TransactionsContainer} from '../views/transactions/transactionsContainer';
import {TransactionsContainerProps} from '../views/transactions/transactionsContainerProps';
import {CurrentLocation} from '../views/utilities/currentLocation';
import {AppProps} from './appProps';

/*
 * The entry point view
 */
export function App(props: AppProps): JSX.Element {

    const model = props.viewModel;
    model.useState();

    const [isMobileLayout, setIsMobileLayout] = useState(isMobileLayoutRequired());
    const navigate = useNavigate();

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

        // Subscribe to application and window events
        model.eventBus.on(EventNames.LoginRequired, onLoginRequired);
        window.onresize = onResize;
        window.onstorage = onStorage;

        // Initialise the main view model the first time
        await initialiseData();

        // Next deal with the authentication state
        await handlePageLoad();
    }

    /*
     * Initialise the model on startup
     */
    async function initialiseData(): Promise<void> {
        await model.initialise();
    }

    /*
     * Get the authentication state and deal with any login error responses
     */
    async function handlePageLoad(): Promise<void> {

        // Handle any login responses, and navigate back to the pre-login location
        const navigateTo = await model.handlePageLoad();
        if (navigateTo) {
            navigate(navigateTo, { replace: true });
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
    }

    /*
     * Manage navigating home
     */
    async function onHome(): Promise<void> {

        // Handle retrying initialisation
        if (!model.isInitialised) {
            await initialiseData();
        }

        // Handle retrying page load errors
        if (!model.isLoaded) {
            await handlePageLoad();
        }

        if (model.isLoaded) {

            // Navigate home
            navigate('/');

            // Force a data reload if recovering from errors
            if (model.hasError()) {
                model.reloadData(false);
            }
        }
    }

    /*
     * When logout is selected, clear state, then redirect to the logged out view
     */
    async function onLogout(): Promise<void> {

        // Inform other tabs that we are logged out, by writing a local storage item for a short time
        HtmlStorageHelper.raiseLoggedOutEvent();

        // Try to logout, which could fail due to activity on other tab, in which case move to a logged out state
        if (!await model.logout()) {
            onLoggedOut();
        }
    }

    /*
     * When there is a logout on another tab, a local storage update is made and we move to the login screen
     */
    async function onStorage(event: StorageEvent): Promise<void> {

        if (HtmlStorageHelper.isLoggedOutEvent(event)) {
            onLoggedOut();
        }
    }

    /*
     * A shared routine to move to a logged out state
     */
    function onLoggedOut(): void {
        model.onLoggedOut();
        navigate('/loggedout');
    }

    /*
     * For test purposes this makes the access token in secure cookies act expired
     */
    async function onExpireAccessToken(): Promise<void> {
        await model.expireAccessToken();
    }

    /*
     * For test purposes this makes the refresh token and access token in secure cookies act expired
     */
    async function onExpireRefreshToken(): Promise<void> {
        await model.expireRefreshToken();
    }

    /*
     * Handle switching between mobile and desktop browser sizes
     * Avoid excessive re-rendering by sending a maximum of one render per 250 milliseconds
     */
    function onResize(): void {
        setTimeout(() => setIsMobileLayout(isMobileLayoutRequired()), 250);
    }

    /*
     * Calculate whether to use mobile views
     */
    function isMobileLayoutRequired(): boolean {
        return window.innerWidth < 768;
    }

    function getTitleProps(): TitleViewProps {

        if (model.isLoaded) {

            return {
                userInfo: {
                    viewModel: model.getUserInfoViewModel(),
                },
            };
        } else {

            return {
                userInfo: null,
            };
        }
    }

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

    function getErrorProps(): ErrorSummaryViewProps {

        return {
            error: model.error!,
            errorsToIgnore: [],
            containingViewName: 'main',
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'SPA Error',
            centred: true,
        };
    }

    function getSessionProps(): SessionViewProps {

        return {
            sessionId: SessionManager.get(),
            eventBus: model.eventBus,
        };
    }

    function getCompaniesProps(): CompaniesContainerProps {

        return {
            viewModel: model.getCompaniesViewModel(),
            isMobileLayout,
        };
    }

    function getTransactionsProps(): TransactionsContainerProps {

        return {
            viewModel: model.getTransactionsViewModel(),
            navigate,
        };
    }

    function getLoginRequiredProps(): LoginRequiredViewProps {

        return {
            eventBus: model.eventBus,
            navigate,
        };
    }

    return (
        <>
            <TitleView {...getTitleProps()} />
            <HeaderButtonsView {...getHeaderButtonProps()} />
            {model.error && <ErrorSummaryView {...getErrorProps()} />}
            {model.isLoaded &&
                <>
                    <SessionView {...getSessionProps()} />
                    <Routes>
                        <Route path='/companies/:id' element={<TransactionsContainer {...getTransactionsProps()} />} />
                        <Route path='/loggedout'     element={<LoginRequiredView {...getLoginRequiredProps()} />} />
                        <Route path='/*'             element={<CompaniesContainer {...getCompaniesProps()} />} />
                    </Routes>
                </>
            }
        </>
    );
}
