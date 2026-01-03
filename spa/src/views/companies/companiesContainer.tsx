import {JSX, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {CurrentLocation} from '../utilities/currentLocation';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {CompaniesContainerProps} from './companiesContainerProps';
import {CompaniesDesktopView} from './companiesDesktopView';
import {CompaniesMobileView} from './companiesMobileView';
import {CompaniesViewProps} from './companiesViewProps';

/*
 * Render the companies view to replace the existing view
 */
export function CompaniesContainer(props: CompaniesContainerProps): JSX.Element {

    const model = props.viewModel;
    model.useState();
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
     * Get data from the API and update state
     */
    async function loadData(options?: ViewLoadOptions): Promise<void> {
        await model.callApi(options);
    }

    function getErrorProps(): ErrorSummaryViewProps {

        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        return {
            error: model.getError()!,
            errorsToIgnore: [ErrorCodes.loginRequired],
            containingViewName: 'companies',
            hyperlinkMessage: 'Problem Encountered in Companies View',
            dialogTitle: 'Companies View Error',
            centred: true,
        };
    }

    function getChildProps(): CompaniesViewProps {

        return {
            companies: model.getCompanies(),
        };
    }

    return  (
        <>
            {model.getError() && <ErrorSummaryView {...getErrorProps()}/>}
            {model.getCompanies().length > 0 && (props.isMobileLayout ?
                <CompaniesMobileView {...getChildProps()}/> :
                <CompaniesDesktopView {...getChildProps()}/>)}

        </>
    );
}
