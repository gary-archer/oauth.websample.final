import {JSX, useEffect, useSyncExternalStore} from 'react';
import {useLocation, useParams} from 'react-router';
import {Transaction} from '../../api/entities/transaction';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ApiRequestEvent} from '../../plumbing/events/apiRequestEvent';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {CurrentLocation} from '../utilities/currentLocation';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {TransactionsViewProps} from './transactionsViewProps';

/*
 * The main transactions view
 */
export function TransactionsView(props: TransactionsViewProps): JSX.Element {

    // Subscribe to state from the view model
    const model = props.viewModel;
    const {data, error} = useSyncExternalStore(
        model.subscribe.bind(model),
        model.getSnapshot.bind(model),
    );

    // Update the current path and get input parameters
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
        const options = {
            forceReload: false,
            causeError: false,
        };
        await loadData(options);
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
     * Get data from the API; the view model notifies subscribers when done
     */
    async function loadData(options: ViewLoadOptions): Promise<void> {

        // Forbidden errors are expected if the user edits the browser URL
        // Treat the API request as successfully completed and navigate back to the home view
        const onForbidden = () => {
            model.getEventBus().emit(EventNames.ApiRequest, null, new ApiRequestEvent(true));
            props.navigate('/');
        };

        await model.callApi(companyId, options, onForbidden);
    }

    /*
     * Render a single transaction as a card
     */
    function renderTransaction(transaction: Transaction): JSX.Element {

        return (
            <div key={transaction.id} className='rounded-lg border border-gray-300 p-3'>
                <div className='flex mt-1'>
                    <div className='w-1/2'>
                        Transaction ID
                    </div>
                    <div className='w-1/2 text-right font-bold text-blue-700'>
                        {transaction.id}
                    </div>
                </div>
                <div className='flex mt-1'>
                    <div className='w-1/2'>
                        Investor ID
                    </div>
                    <div className='w-1/2 text-right font-bold text-blue-700'>
                        {transaction.investorId}
                    </div>
                </div>
                <div className='flex mt-1'>
                    <div className='w-1/2'>
                        Amount USD
                    </div>
                    <div className='w-1/2 text-right font-bold text-green-700'>
                        {Number(transaction.amountUsd).toLocaleString()}
                    </div>
                </div>
            </div>
        );
    }

    /*
     * Render the collection of transactions as cards
     */
    function renderData(): JSX.Element {

        return (
            <div className='mt-3'>
                <div className='bg-gray-100 p-3 text-center font-bold'>
                    Today&apos;s Transactions for {data?.company.name}
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-3'>
                    {data?.transactions.map((transaction) => renderTransaction(transaction))}
                </div>
            </div>
        );
    }

    /*
     * Get details for the error display
     */
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

    return  (
        <>
            {error && <ErrorSummaryView {...getErrorProps()}/>}
            {data && renderData()}
        </>
    );
}
