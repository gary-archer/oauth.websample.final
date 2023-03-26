import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import {Route, Routes, useNavigate} from 'react-router-dom';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {ErrorSummaryView} from '../views/errors/errorSummaryView';
import {DefaultHandler} from '../views/handlers/defaultHandler';
import {LoginRequiredHandler} from '../views/handlers/loginRequiredHandler';
import {LogoutHandler} from '../views/handlers/LogoutHandler';
import {TitleView} from '../views/headings/titleView';
import {AppProps} from './appProps';
import {AppState} from './appState';

/*
 * The main application class
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
            setError(null);

            // Subscribe to window events
            window.onresize = onResize;

            // Update state
            setState((s) => {
                return {
                    ...s,
                    isInitialised: true,
                };
            });

        } catch (e: any) {

            // Render startup errors
            setError(e);
        }
    }

    /*
     * Cleanup logic
     */
    function cleanup() {
        window.onresize = null;
    }

    /*
     * Page load logic when the shell app needs to determine the authenticated state
     */
    async function onPageLoad(): Promise<void> {

        try {

            // Run the page load handler, which may handle a login response and redirect back to the calling app
            const pageLoadResult = await model.authenticator.handlePageLoad();
            if (!pageLoadResult.handled) {

                if (pageLoadResult.isLoggedIn) {

                    // If there are valid cookies then navigate to the default app
                    location.href = `${location.origin}${model.configuration.defaultAppBasePath}`;

                } else {

                    // Otherwise move to a view that renders a login button
                    navigate('/login');
                }
            }

        } catch (e: any) {

            // Handle any page load errors
            setError(e);
        }
    }

    /*
     * Try to run an OpenID Connect code flow when login is clicked
     */
    async function onLogin(): Promise<void> {

        try {

            await props.viewModel.authenticator.login();

        } catch(e: any) {

            setError(e);
        }
    }

    /*
     * Run an OpenID Connect logout when a micro-UI requests the /logout path
     * Swallow errors, since the user typically cannot recover
     */
    async function onLogout(): Promise<void> {

        try {

            await props.viewModel.authenticator.logout();

        } catch(e: any) {

            const error = ErrorFactory.fromException(e);
            ErrorConsoleReporter.output(error);
            navigate('/loggedout');
        }
    }

    /*
     * After an error, redirect home to re-run page load logic
     */
    function onRetry() {
        location.href = location.origin;
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
     * A shared subroutine to set error state
     */
    function setError(e: any): void {

        const error = e ? ErrorFactory.fromException(e) : null;

        setState((s) => {
            return {
                ...s,
                error,
            };
        });
    }

    /*
     * Render basic details before the view model has initialised
     */
    function renderInitialScreen(): JSX.Element {

        const errorSummaryProps = {
            error: state.error,
            onRetry: onRetry,
        };

        return (
            <>
                <TitleView />
                <ErrorSummaryView {...errorSummaryProps} />
            </>
        );
    }

    /*
     * Render the main layout
     */
    function renderMain(): JSX.Element {

        const errorSummaryProps = {
            error: state.error,
            onRetry: onRetry,
        };

        const loginHandlerProps = {
            isAfterLogout: false,
            onLogin,
            error: state.error,
        };

        const loggedOutHandlerProps = {
            isAfterLogout: true,
            onLogin,
            error: state.error,
        };

        const logoutHandlerProps = {
            onLogout,
        };

        const defaultProps = {
            onPageLoad,
        };

        return (
            <>
                <TitleView />
                <ErrorSummaryView {...errorSummaryProps} />
                <Routes>
                    <Route path='/login'     element={<LoginRequiredHandler {...loginHandlerProps} />} />
                    <Route path='/loggedout' element={<LoginRequiredHandler {...loggedOutHandlerProps} />} />
                    <Route path='/logout'    element={<LogoutHandler {...logoutHandlerProps} />} />
                    <Route path='/*'         element={<DefaultHandler {...defaultProps} />} />
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
