import React, {useEffect, useState} from 'react';
import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {ReloadMainViewEvent} from '../../plumbing/events/reloadMainViewEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
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

        const onSuccess = (data: CompanyTransactions) => {
            setState((s) => {
                return {
                    ...s,
                    data,
                    error: null,
                };
            });
        };

        const onError = (isExpected: boolean, error: UIError) => {

            if (isExpected) {

                // For 'expected' errors, return to the home view
                location.hash = '#';

            } else {

                // Otherwise render the error
                setState((s) => {
                    return {
                        ...s,
                        data: null,
                        error,
                    };
                });
            }
        };

        model.callApi(companyId, onSuccess, onError, causeError);
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
            containingViewName: 'transactions',
            hyperlinkMessage: 'Problem Encountered in Transactions View',
            dialogTitle: 'Transactions View Error',
            centred: true,
        };
        return (
            <ErrorSummaryView {...errorProps}/>
        );
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
