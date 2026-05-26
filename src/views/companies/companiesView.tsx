import {JSX, useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {CurrentLocation} from '../utilities/currentLocation';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {CompaniesChildViewProps} from './companiesChildViewProps';
import {CompaniesDesktopChildView} from './companiesDesktopChildView';
import {CompaniesMobileChildView} from './companiesMobileChildView';
import {CompaniesViewProps} from './companiesViewProps';

/*
 * Render the companies view
 */
export function CompaniesView(props: CompaniesViewProps): JSX.Element {

    // Initialize React state from the view model
    const model = props.viewModel;
    const [companies, setCompanies] = useState(model.getCompanies());
    const [error, setError] = useState(model.getError());

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
     * Get data from the API and update React state
     */
    async function loadData(options?: ViewLoadOptions): Promise<void> {

        await model.callApi(options);
        setCompanies(model.getCompanies());
        setError(model.getError());
    }

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

    function getChildProps(): CompaniesChildViewProps {

        return {
            companies,
        };
    }

    return  (
        <>
            {error && <ErrorSummaryView {...getErrorProps()}/>}
            {companies.length > 0 && (props.isMobileLayout ?
                <CompaniesMobileChildView {...getChildProps()}/> :
                <CompaniesDesktopChildView {...getChildProps()}/>)}

        </>
    );
}
