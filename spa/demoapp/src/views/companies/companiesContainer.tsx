import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {ApiClientContext} from '../../api/client/apiClientContext';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {CurrentLocation} from '../utilities/currentLocation';
import {CompaniesContainerProps} from './companiesContainerProps';
import {CompaniesContainerState} from './companiesContainerState';
import {CompaniesDesktopView} from './companiesDesktopView';
import {CompaniesMobileView} from './companiesMobileView';

/*
 * Render the companies view to replace the existing view
 */
export function CompaniesContainer(props: CompaniesContainerProps): JSX.Element {

    const model = props.viewModel;
    const [state, setState] = useState<CompaniesContainerState>({
        companies: model.companies,
        error: model.error,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    CurrentLocation.path = useLocation().pathname;

    /*
     * Subscribe for reload events and then do the initial load of data
     */
    async function startup(): Promise<void> {
        model.eventBus.on(EventNames.ReloadData, onReload);
        await loadData(new ApiClientContext());
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

        const context = new ApiClientContext();
        context.forceReload = true;
        context.causeError = event.causeError,
        loadData(context);
    }

    /*
     * Get data from the API and update state
     */
    async function loadData(context: ApiClientContext): Promise<void> {

        await model.callApi(context);
        setState((s) => {
            return {
                ...s,
                companies: model.companies,
                error: model.error,
            };
        });
    }

    /*
     * Return error props when there is an error to render
     */
    function getErrorProps(): ErrorSummaryViewProps {

        return {
            error: state.error!,
            errorsToIgnore: [ErrorCodes.loginRequired],
            containingViewName: 'companies',
            hyperlinkMessage: 'Problem Encountered in Companies View',
            dialogTitle: 'Companies View Error',
            centred: true,
        };
    }

    const childProps = {
        companies: state.companies,
    };

    return  (
        <>
            {state.error && <ErrorSummaryView {...getErrorProps()}/>}

            {state.companies.length > 0 && (props.isMobileLayout ?
                <CompaniesMobileView {...childProps}/> :
                <CompaniesDesktopView {...childProps}/>)}

        </>
    );
}
