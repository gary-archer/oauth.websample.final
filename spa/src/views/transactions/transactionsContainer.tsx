import React, {useEffect} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {CurrentLocation} from '../utilities/currentLocation';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {TransactionsContainerProps} from './transactionsContainerProps';
import {TransactionsView} from './transactionsView';
import {TransactionsViewProps} from './transactionsViewProps';

/*
 * Render the transactions view to replace the existing view
 */
export function TransactionsContainer(props: TransactionsContainerProps): JSX.Element {

    const model = props.viewModel;
    model.useState();

    const params = useParams();
    const companyId = params.id!;
    CurrentLocation.path = useLocation().pathname;

    useEffect(() => {
        startup();
        return () => cleanup();
    }, [companyId]);

    /*
     * View startup logic
     */
    async function startup(): Promise<void> {

        // Subscribe for reload events
        model.eventBus.emit(EventNames.Navigated, null, new NavigatedEvent(true));
        model.eventBus.on(EventNames.ReloadData, onReload);

        // Do the initial load of data
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
            causeError: event.causeError
        };
        loadData(options);
    }

    /*
     * Get data from the API and update state
     */
    async function loadData(options?: ViewLoadOptions): Promise<void> {

        await model.callApi(companyId, options);

        // For expected forbidden errors, where the user edits the browser URL, return to the home view
        if (model.isForbiddenError()) {
            props.navigate('/');
        }
    }

    function getErrorProps(): ErrorSummaryViewProps {

        return {
            error: model.error!,
            errorsToIgnore: [ErrorCodes.loginRequired],
            containingViewName: 'transactions',
            hyperlinkMessage: 'Problem Encountered in Transactions View',
            dialogTitle: 'Transactions View Error',
            centred: true,
        };
    }

    function getChildProps(): TransactionsViewProps {

        return {
            data: model.transactions!,
        };
    }

    return  (
        <>
            {model.error && <ErrorSummaryView {...getErrorProps()}/>}
            {model.transactions && <TransactionsView {...getChildProps()}/>}
        </>
    );
}
