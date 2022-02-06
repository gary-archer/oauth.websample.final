import React, {useEffect, useState} from 'react';
import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {ReloadMainViewEvent} from '../../plumbing/events/reloadMainViewEvent';
import {SetErrorEvent} from '../../plumbing/events/setErrorEvent';
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
                };
            });
        };

        const onError = (isExpected: boolean, error: UIError) => {

            if (isExpected) {

                // For 'expected' errors, return to the home view
                location.hash = '#';

            } else {

                model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('transactions', error));
                setState((s) => {
                    return {
                        ...s,
                        data: null,
                    };
                });
            }
        };

        model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('transactions', null));
        model.callApi(companyId, onSuccess, onError, causeError);
    }

    /*
     * Conditional rendering based on whether there is data yet
     */
    function renderTransactionsView(): JSX.Element {

        if (!state.data) {

            return (
                <>
                </>
            );
        }

        const childProps = {
            data: state.data,
        };

        return  (
            <>
                {state.data && <TransactionsView {...childProps}/>}
            </>
        );
    }

    const errorProps = {
        eventBus: model.eventBus,
        containingViewName: 'transactions',
        hyperlinkMessage: 'Problem Encountered in Transactions View',
        dialogTitle: 'Transactions View Error',
        centred: true,
    };

    return  (
        <>
            <ErrorSummaryView {...errorProps}/>
            {renderTransactionsView()}
        </>
    );
}
