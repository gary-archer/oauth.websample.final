import React, {useEffect, useState} from 'react';
import {Company} from '../../api/entities/company';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {ReloadMainViewEvent} from '../../plumbing/events/reloadMainViewEvent';
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
        error: null,
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
            setState((s) => {
                return {
                    ...s,
                    companies,
                    error: null,
                };
            });
        };

        const onError = (error: UIError) => {
            setState((s) => {
                return {
                    ...s,
                    companies: [],
                    error,
                };
            });
        };

        model.callApi(onSuccess, onError, causeError);
    }

    /*
     * Output error details if required
     */
    function renderError(): JSX.Element {

        if (state.error!.errorCode === ErrorCodes.loginRequired) {
            return (
                <>
                </>
            );
        }

        const errorProps = {
            containingViewName: 'companies',
            hyperlinkMessage: 'Problem Encountered in Companies View',
            dialogTitle: 'Companies View Error',
            centred: true,
        };

        return (
            <ErrorSummaryView {...errorProps}/>
        );
    }

    // Render an error on failure
    if (state.error) {
        return renderError();
    }

    // Display nothing until there is data
    if (state.companies.length === 0) {
        return (
            <>
            </>
        );
    }

    // Display the desktop or mobile view
    const childProps = {
        companies: state.companies,
    };
    if (props.isMobileLayout) {

        return  (
            <CompaniesMobileView {...childProps}/>
        );

    } else {

        return  (
            <CompaniesDesktopView {...childProps}/>
        );
    }
}
