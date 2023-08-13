import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/lib';
import {EventNames} from '../../plumbing/events/eventNames';
import {ReloadMainViewEvent} from '../../plumbing/events/reloadMainViewEvent';
import {SetErrorEvent} from '../../plumbing/events/setErrorEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
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
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    CurrentLocation.path = useLocation().pathname;

    /*
     * Load data then listen for the reload event
     */
    async function startup(): Promise<void> {

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

        const onSuccess = () => {

            if (model.companies) {
                setState((s) => {
                    return {
                        ...s,
                        companies: model.companies,
                    };
                });
            }
        };

        const onError = (error: UIError) => {

            model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('companies', error));
            setState((s) => {
                return {
                    ...s,
                    companies: [],
                };
            });
        };

        model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('companies', null));
        model.callApi(onSuccess, onError, causeError);
    }

    const childProps = {
        companies: state.companies,
    };

    const errorProps = {
        errorsToIgnore: [ErrorCodes.loginRequired],
        eventBus: model.eventBus,
        containingViewName: 'companies',
        hyperlinkMessage: 'Problem Encountered in Companies View',
        dialogTitle: 'Companies View Error',
        centred: true,
    };

    if (props.isMobileLayout) {

        return  (
            <>
                <ErrorSummaryView {...errorProps}/>
                {state.companies.length > 0 && <CompaniesMobileView {...childProps}/>}
            </>
        );

    } else {

        return  (
            <>
                <ErrorSummaryView {...errorProps}/>
                {state.companies.length > 0 && <CompaniesDesktopView {...childProps}/>}
            </>
        );
    }
}
