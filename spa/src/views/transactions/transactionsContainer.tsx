import React, {useEffect, useState} from 'react';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {ReloadMainViewEvent} from '../../plumbing/events/reloadMainViewEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ApiViewNames} from '../utilities/apiViewNames';
import {TransactionsContainerProps} from './transactionsContainerProps';
import {TransactionsContainerState} from './transactionsContainerState';
import {TransactionsView} from './transactionsView';

/*
 * Render the transactions view to replace the existing view
 */
export function TransactionsContainer(props: TransactionsContainerProps): JSX.Element {

    const model = props.viewModel;
    const companyId = props.match.params.id;
    const [state, setState] = useState<TransactionsContainerState>({
        data: null,
        error: null,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, [companyId]);

    /*
     * Load data then listen for the reload event
     */
    async function startup(): Promise<void> {

        // Inform other parts of the app which view is active
        model.eventBus.emit(EventNames.Navigate, null, new NavigateEvent(true));

        // Subscribe for reload events
        model.eventBus.on(EventNames.ReloadMainView, onReload);

        // Do the initial load of data
        await loadData(false);
    }

    /*
     * Unsubscribe when we unload
     */
    function cleanup(): void {
        model.eventBus.detach(EventNames.ReloadMainView, onReload);
    }

    /*
     * Receive the reload event
     */
    function onReload(event: ReloadMainViewEvent): void {
        loadData(event.causeError);
    }

    /*
     * Get data from the API and update state
     */
    async function loadData(causeError: boolean): Promise<void> {

        try {

            // Get data from the API
            model.apiViewEvents.onViewLoading(ApiViewNames.Main);
            const data = await model.apiClient.getCompanyTransactions(companyId, {causeError});
            model.apiViewEvents.onViewLoaded(ApiViewNames.Main);

            setState((s) => {
                return {
                    ...s,
                    data,
                    error: null,
                };
            });

        } catch (e) {

            // Handle the error
            const error = ErrorHandler.getFromException(e);
            const isExpected = isExpectedApiError(error);
            if (isExpected) {

                // For 'expected' errors, return to the home view
                model.apiViewEvents.onViewLoaded(ApiViewNames.Main);
                location.hash = '#';

            } else {

                // Indicate failure
                setState((s) => {
                    return {
                        ...s,
                        error,
                    };
                });
                model.apiViewEvents.onViewLoadFailed(ApiViewNames.Main, error);
            }
        }
    }

    /*
     * Output error details if required
     */
    function renderError(): JSX.Element {

        if (state.error!.errorCode === ErrorCodes.loginRequired) {
            return (
                <>
                </>
            );
        }

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered in Transactions View',
            dialogTitle: 'Transactions View Error',
            error: state.error,
            centred: true,
        };
        return (
            <ErrorSummaryView {...errorProps}/>
        );
    }

    /*
     * Handle 'business errors' received from the API
     */
    function isExpectedApiError(error: UIError): boolean {

        if (error.statusCode === 404 && error.errorCode === ErrorCodes.companyNotFound) {

            // User typed an id value outside of allowed company ids
            return true;

        }

        if (error.statusCode === 400 && error.errorCode === ErrorCodes.invalidCompanyId) {

            // User typed an invalid id such as 'abc'
            return true;
        }

        return false;
    }

    // Render an error on failure
    if (state.error) {
        return renderError();
    }

    // Display nothing until there is data
    if (!state.data) {
        return (
            <>
            </>
        );
    }

    // Display the desktop or mobile view otherwise
    const childProps = {
        data: state.data,
    };

    return  (
        <TransactionsView {...childProps}/>
    );
}
