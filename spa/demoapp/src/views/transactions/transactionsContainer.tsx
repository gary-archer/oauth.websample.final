import React, {useEffect, useState} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/lib';
import {EventNames} from '../../plumbing/events/eventNames';
import {ReloadMainViewEvent} from '../../plumbing/events/reloadMainViewEvent';
import {SetErrorEvent} from '../../plumbing/events/setErrorEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {CurrentLocation} from '../utilities/currentLocation';
import {TransactionsContainerProps} from './transactionsContainerProps';
import {TransactionsContainerState} from './transactionsContainerState';
import {TransactionsView} from './transactionsView';

/*
 * Render the transactions view to replace the existing view
 */
export function TransactionsContainer(props: TransactionsContainerProps): JSX.Element {

    const model = props.viewModel;
    const params = useParams();
    const companyId = params.id!;
    const [state, setState] = useState<TransactionsContainerState>({
        data: model.transactions,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, [companyId]);

    CurrentLocation.path = useLocation().pathname;

    /*
     * Load data then listen for the reload event
     */
    async function startup(): Promise<void> {

        // Subscribe for reload events
        model.eventBus.on(EventNames.ReloadMainView, onReload);

        // Do the initial load of data
        await loadData();
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

        const options = {
            forceReload: true,
            causeError: event.causeError,
        };
        loadData(options);
    }

    /*
     * Get data from the API and update state
     */
    async function loadData(options?: ApiClientOptions): Promise<void> {

        const onSuccess = () => {

            if (model.transactions) {
                setState((s) => {
                    return {
                        ...s,
                        data: model.transactions,
                    };
                });
            }
        };

        const onError = (isExpected: boolean, error: UIError) => {

            if (isExpected) {

                // For 'expected' errors, return to the home view
                props.navigate('/');

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
        model.callApi(companyId, onSuccess, onError, options);
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
                <TransactionsView {...childProps}/>
            </>
        );
    }

    const errorProps = {
        errorsToIgnore: [ErrorCodes.loginRequired],
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
