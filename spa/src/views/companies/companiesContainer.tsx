import React, {useEffect, useState} from 'react';
import {Company} from '../../api/entities/company';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {ReloadMainViewEvent} from '../../plumbing/events/reloadMainViewEvent';
import {SetErrorEvent} from '../../plumbing/events/setErrorEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
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
        companies: [],
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    /*
     * Load data then listen for the reload event
     */
    async function startup(): Promise<void> {

        // Inform other parts of the app which view is active
        model.eventBus.emit(EventNames.Navigate, null, new NavigateEvent(true));

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

        const onSuccess = (companies: Company[]) => {

            model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('companies', null));
            setState((s) => {
                return {
                    ...s,
                    companies,
                };
            });
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

        model.callApi(onSuccess, onError, causeError);
    }

    const childProps = {
        companies: state.companies,
    };

    const errorProps = {
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
