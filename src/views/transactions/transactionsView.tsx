import {JSX, useEffect, useState} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {CurrentLocation} from '../utilities/currentLocation';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {TransactionsChildView} from './transactionsChildView';
import {TransactionsChildViewProps} from './transactionsChildViewProps';
import {TransactionsViewProps} from './transactionsViewProps';

/*
 * The main transactions view
 */
export function TransactionsView(props: TransactionsViewProps): JSX.Element {

    // Initialize React state from the view model
    const model = props.viewModel;
    const [transactions, setTransactions] = useState(model.getTransactions());
    const [error, setError] = useState(model.getError());

    CurrentLocation.path = useLocation().pathname;
    const params = useParams();
    const companyId = params.id || '';

    useEffect(() => {
        startup();
        return () => cleanup();
    }, [companyId]);

    /*
     * View startup logic
     */
    async function startup(): Promise<void> {

        // Subscribe for reload events
        model.getEventBus().emit(EventNames.Navigated, null, new NavigatedEvent(true));
        model.getEventBus().on(EventNames.ReloadData, onReload);

        // Do the initial load of data
        await loadData();
    }

    /*
     * Unsubscribe when we unload
     */
    function cleanup(): void {
        model.getEventBus().detach(EventNames.ReloadData, onReload);
    }

    /*
     * Receive the reload event
     */
    function onReload(event: ReloadDataEvent): void {

        const options = {
            forceReload: true,
            causeError: event.getCauseError(),
        };
        loadData(options);
    }

    /*
     * Get data from the API and update state
     */
    async function loadData(options?: ViewLoadOptions): Promise<void> {

        await model.callApi(companyId, options);
        setTransactions(model.getTransactions());
        setError(model.getError());

        // For expected forbidden errors, where the user edits the browser URL, return to the home view
        if (model.isForbiddenError()) {
            props.navigate('/');
        }
    }

    function getErrorProps(): ErrorSummaryViewProps {

        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        return {
            error: error!,
            errorsToIgnore: [ErrorCodes.loginRequired],
            containingViewName: 'transactions',
            hyperlinkMessage: 'Problem Encountered in Transactions View',
            dialogTitle: 'Transactions View Error',
            centred: true,
        };
    }

    function getChildViewProps(): TransactionsChildViewProps {

        return {
            data: transactions!,
        };
    }

    return  (
        <>
            {error && <ErrorSummaryView {...getErrorProps()}/>}
            {transactions && <TransactionsChildView {...getChildViewProps()}/>}
        </>
    );
}
