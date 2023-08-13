import React, {useEffect, useState} from 'react';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/lib';
import {EventNames} from '../../plumbing/events/eventNames';
import {ReloadUserInfoEvent} from '../../plumbing/events/reloadUserInfoEvent';
import {SetErrorEvent} from '../../plumbing/events/setErrorEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
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
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    /*
     * Subscribe to events and then do the initial load of data
     */
    async function startup(): Promise<void> {

        // Subscribe for reload events
        model.eventBus.on(EventNames.ReloadUserInfo, onReload);

        // Do the initial load of data
        await loadData();
    }

    /*
     * Unsubscribe when we unload
     */
    function cleanup(): void {
        model.eventBus.detach(EventNames.ReloadUserInfo, onReload);
    }

    /*
     * Process the reload event
     */
    function onReload(event: ReloadUserInfoEvent): void {

        const options = {
            forceReload: true,
            causeError: event.causeError,
        };
        loadData(options);
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
    async function loadData(options?: ApiClientOptions): Promise<void> {

        const onSuccess = () => {

            if (model.oauthUserInfo && model.apiUserInfo) {
                setState((s) => {
                    return {
                        ...s,
                        oauthUserInfo: model.oauthUserInfo,
                        apiUserInfo : model.apiUserInfo,
                    };
                });
            }
        };

        const onError = (error: UIError) => {

            model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('userinfo', error));
            setState((s) => {
                return {
                    ...s,
                    oauthUserInfo: null,
                    apiUserInfo: null,
                };
            });
        };

        model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('userinfo', null));
        model.callApi(onSuccess, onError, options);
    }

    const errorProps = {
        errorsToIgnore: [ErrorCodes.loginRequired],
        eventBus: model.eventBus,
        containingViewName: 'userinfo',
        hyperlinkMessage: 'Problem Encountered',
        dialogTitle: 'User Info Error',
        centred: false,
    };

    return (
        <>
            <div className='text-end mx-auto'>
                <ErrorSummaryView {...errorProps}/>
            </div>
            {state.oauthUserInfo && state.apiUserInfo &&
            <div className='text-end mx-auto'>
                <p className='fw-bold'>{`${getUserNameForDisplay()}`}</p>
            </div>}
        </>
    );
}
