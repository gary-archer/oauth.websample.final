import React, {useEffect, useState} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
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
        error: null,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, [companyId]);

    CurrentLocation.path = useLocation().pathname;

    /*
     * Subscribe for reload events and then do the initial load of data
     */
    async function startup(): Promise<void> {
        model.eventBus.on(EventNames.ReloadData, onReload);
        await loadData();
    }

    /*
     * Unsubscribe when we unload
     */
    function cleanup(): void {
        model.eventBus.detach(EventNames.ReloadData, onReload);
    }

    /*
     * Receive the reload event
     */
    function onReload(event: ReloadDataEvent): void {

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

        await model.callApi(companyId, options);

        if (model.error && model.isExpectedApiError()) {

            // For 'expected' errors, return to the home view
            props.navigate('/');

        } else {

            // Otherwise update state
            setState((s) => {
                return {
                    ...s,
                    data: model.transactions,
                    error: model.error,
                };
            });
        }
    }

    /*
     * Return error props when there is an error to render
     */
    function getErrorProps(): ErrorSummaryViewProps {

        return {
            error: state.error!,
            errorsToIgnore: [ErrorCodes.loginRequired],
            containingViewName: 'transactions',
            hyperlinkMessage: 'Problem Encountered in Transactions View',
            dialogTitle: 'Transactions View Error',
            centred: true,
        };
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

    return  (
        <>
            {state.error && <ErrorSummaryView {...getErrorProps()}/>}
            {renderTransactionsView()}
        </>
    );
}
