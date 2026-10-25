import {JSX, useEffect, useSyncExternalStore} from 'react';
import {Link, useLocation} from 'react-router';
import {Company} from '../../api/entities/company';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {CurrentLocation} from '../utilities/currentLocation';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {CompaniesViewProps} from './companiesViewProps';

/*
 * Render the companies view
 */
export function CompaniesView(props: CompaniesViewProps): JSX.Element {

    // Subscribe to state from the view model
    const model = props.viewModel;
    const {companies, error} = useSyncExternalStore(
        model.subscribe.bind(model),
        model.getSnapshot.bind(model),
    );

    // Update the current path
    CurrentLocation.path = useLocation().pathname;

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

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
     * Unsubscribe from events when we unload
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
    async function loadData(options?: ViewLoadOptions): Promise<void> {
        await model.callApi(options);
    }

    /*
     * Get details for the error display
     */
    function getErrorProps(): ErrorSummaryViewProps {

        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        return {
            error: error!,
            errorsToIgnore: [ErrorCodes.loginRequired],
            containingViewName: 'companies',
            hyperlinkMessage: 'Problem Encountered in Companies View',
            dialogTitle: 'Companies View Error',
            centred: true,
        };
    }

    /*
     * Render a company as a card on mobile browsers
     */
    function renderCard(company: Company): JSX.Element {

        return (
            <div key={company.id} className='p-3'>
                <div className='grid grid-cols-12'>
                    <div className='col-span-6 text-2xl font-medium mx-5'>
                        <Link to={`/companies/${company.id}`} className='text-blue-600 underline'>
                            {`Company ${company.id}`}
                        </Link>
                    </div>
                    <div className='col-span-6 font-bold text-2xl font-medium mx-5'>
                        {company.region}
                    </div>
                </div>
                <div className='grid grid-cols-12 mt-10'>
                    <div className='col-span-6 mx-5'>
                        Target USD
                    </div>
                    <div className='col-span-6 text-green-700 font-bold mx-5'>
                        {Number(company.targetUsd).toLocaleString()}
                    </div>
                </div>
                <div className='grid grid-cols-12 mt-5'>
                    <div className='col-span-6 mx-5'>
                        Investment USD
                    </div>
                    <div className='col-span-6 text-green-700 font-bold mx-5'>
                        {Number(company.investmentUsd).toLocaleString()}
                    </div>
                </div>
                <div className='grid grid-cols-12 mt-5'>
                    <div className='col-span-6 mx-5'>
                        # Investors
                    </div>
                    <div className='col-span-6 font-bold mx-5'>
                        {company.noInvestors}
                    </div>
                </div>
                <hr className='text-gray-300 mt-5' />
            </div>
        );
    }

    /*
     * Render a company as a list row on desktop browsers
     */
    function renderListRow(company: Company): JSX.Element {

        return (
            <div className='grid grid-cols-12 p-3 p-3 mt-5' key={company.id}>
                <div className='col-span-2 text-center'>
                    {company.name}
                </div>
                <div className='col-span-2 text-center'>
                    {company.region}
                </div>
                <div className='col-span-2 text-center'>
                    <Link to={`/companies/${company.id}`} className='text-blue-600 underline'>
                        View Transactions
                    </Link>
                </div>
                <div className='col-span-2 text-green-700 font-bold text-right'>
                    {Number(company.targetUsd).toLocaleString()}
                </div>
                <div className='col-span-2 text-green-700 font-bold text-right'>
                    {Number(company.investmentUsd).toLocaleString()}
                </div>
                <div className='col-span-2 font-bold text-right'>
                    {company.noInvestors}
                </div>
            </div>
        );
    }

    /*
     * Render cards in a mobile browser
     */
    function renderNarrowView(): JSX.Element {

        return  (
            <div className='mt-3'>
                <div className='bg-gray-100 p-3 font-bold text-center'>
                    Company List
                </div>
                <div className='mt-3'>
                    {companies.map((company) => renderCard(company))}
                </div>
            </div>
        );
    }

    /*
     * Render a list in a desktop browser
     */
    function renderWideView(): JSX.Element {

        return  (
            <div className='mt-3'>
                <div className='grid grid-cols-12 bg-gray-100 p-3'>
                    <div className='col-span-2 font-bold text-center'>Account</div>
                    <div className='col-span-2 font-bold text-center'>Region</div>
                    <div className='col-span-2' />
                    <div className='col-span-2 font-bold text-right'>Target USD</div>
                    <div className='col-span-2 font-bold text-right'>Investment USD</div>
                    <div className='col-span-2 font-bold text-right'># Investors</div>
                </div>
                <div>
                    {companies.map((company) => renderListRow(company))}
                </div>
            </div>
        );
    }

    return  (
        <>
            {error && <ErrorSummaryView {...getErrorProps()}/>}
            {companies.length > 0 && (props.isMobileLayout ? renderNarrowView() : renderWideView())}
        </>
    );
}
