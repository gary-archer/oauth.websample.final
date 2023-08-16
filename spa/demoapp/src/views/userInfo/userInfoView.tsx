import React, {useEffect, useState} from 'react';
import {ApiClientContext} from '../../api/client/apiClientContext';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {UserInfoViewProps} from './userInfoViewProps';
import {UserInfoViewState} from './userInfoViewState';

/*
 * A simple component to render the logged in user
 */
export function UserInfoView(props: UserInfoViewProps): JSX.Element {

    const model = props.viewModel;
    const [state, setState] = useState<UserInfoViewState>({
        oauthUserInfo: model.oauthUserInfo,
        apiUserInfo: model.apiUserInfo,
        error: null,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

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
     * Process the reload event
     */
    function onReload(event: ReloadDataEvent): void {

        const context = new ApiClientContext();
        context.forceReload = true;
        context.causeError = event.causeError,
        loadData(context);
    }

    /*
     * Get a name string using both OAuth user info API specific user info
     */
    function getUserNameForDisplay(): string {

        if (state.oauthUserInfo && state.apiUserInfo) {

            let name = `${state.oauthUserInfo.givenName} ${state.oauthUserInfo.familyName}`;
            if (state.apiUserInfo.role === 'admin') {
                name += ' (ADMIN)';
            }

            return name;
        }

        return '';
    }

    /*
     * Ask the model to load data, then update state
     */
    async function loadData(context: ApiClientContext): Promise<void> {

        await model.callApi(context);
        setState((s) => {
            return {
                ...s,
                oauthUserInfo: model.oauthUserInfo,
                apiUserInfo : model.apiUserInfo,
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
            containingViewName: 'userinfo',
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'User Info Error',
            centred: false,
        };
    }

    return (
        <>
            {state.error && <div className='text-end mx-auto'>
                <ErrorSummaryView {...getErrorProps()}/>
            </div>}
            {state.oauthUserInfo && state.apiUserInfo &&
            <div className='text-end mx-auto'>
                <p className='fw-bold'>{`${getUserNameForDisplay()}`}</p>
            </div>}
        </>
    );
}
