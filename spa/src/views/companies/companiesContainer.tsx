import React, {useEffect, useState} from 'react';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {EventNames} from '../../plumbing/events/eventNames';
import {ReloadMainViewEvent} from '../../plumbing/events/reloadMainViewEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ApiViewNames} from '../utilities/apiViewNames';
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

        props.onLoading();
        model.eventBus.on(EventNames.ReloadMainView, onReload);
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

        try {
            setState((s) => {
                return {
                    ...s,
                    error: null,
                };
            });

            model.apiViewEvents.onViewLoading(ApiViewNames.Main);
            const companies = await model.apiClient.getCompanyList({causeError});
            model.apiViewEvents.onViewLoaded(ApiViewNames.Main);

            setState((s) => {
                return {
                    ...s,
                    companies,
                    error: null,
                };
            });

        } catch (e) {

            const error = ErrorHandler.getFromException(e);
            setState((s) => {
                return {
                    ...s,
                    companies: [],
                    error,
                };
            });
            model.apiViewEvents.onViewLoadFailed(ApiViewNames.Main, error);
        }
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
            hyperlinkMessage: 'Problem Encountered in Companies View',
            dialogTitle: 'Companies View Error',
            error: state.error,
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
    if (props.isMobileSize) {

        return  (
            <CompaniesMobileView {...childProps}/>
        );

    } else {

        return  (
            <CompaniesDesktopView {...childProps}/>
        );
    }
}
