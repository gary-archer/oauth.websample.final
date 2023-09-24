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
import {SessionView} from '../views/headings/sessionView';
import {SessionViewProps} from '../views/headings/sessionViewProps';
import {TitleView} from '../views/headings/titleView';
import {TitleViewProps} from '../views/headings/titleViewProps';
import {TransactionsContainer} from '../views/transactions/transactionsContainer';
import {TransactionsContainerProps} from '../views/transactions/transactionsContainerProps';
import {CurrentLocation} from '../views/utilities/currentLocation';
import {AppProps} from './appProps';

/*
 * The application shell component
 */
export function App(props: AppProps): JSX.Element {

    const model = props.viewModel;
    model.useState();

    const [isMobileLayout, setMobileLayout] = useState(false);
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
                await model.reloadData(false);
            }
        }
    }

    /*
     * Handle reloads and updating the error state
     */
    async function onReloadData(causeError: boolean): Promise<void> {
        await model.reloadData(causeError);
    }

    /*
     * When logout is selected, redirect to the shell app, which will implement the logout details
     */
    async function onLogout(): Promise<void> {
        await model.logout();
        HtmlStorageHelper.loggedOut = true;
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
        setTimeout(() => setMobileLayout(window.innerWidth < 768), 250);
    }

    /*
     * When there is a logout on another tab, a local storage update is made and we move to the login screen
     */
    async function onStorage(event: StorageEvent): Promise<void> {

        if (HtmlStorageHelper.isLoggedOutEvent(event)) {
            await model.authenticator.onLoggedOut();
        }
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
            handleReloadDataClick: onReloadData,
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

    return (
        <>
            <TitleView {...getTitleProps()} />
            <HeaderButtonsView {...getHeaderButtonProps()} />
            {model.error &&
                <ErrorSummaryView {...getErrorProps()} />
            }
            <SessionView {...getSessionProps()} />
            {model.isLoaded &&
                <Routes>
                    <Route path='/companies/:id' element={<TransactionsContainer {...getTransactionsProps()} />} />
                    <Route path='/*'             element={<CompaniesContainer {...getCompaniesProps()} />} />
                </Routes>
            }
        </>
    );
}
