import React, {useEffect, useState} from 'react';
import {UserInfo} from '../../api/entities/userInfo';
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
        userInfo: null,
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
        await loadData(false);
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
        loadData(true, event.causeError);
    }

    /*
     * Ask the model to load data, then update state
     */
    async function loadData(reload = false, causeError = false): Promise<void> {

        const onSuccess = (userInfo: UserInfo) => {

            setState((s) => {
                return {
                    ...s,
                    userInfo,
                };
            });
        };

        const onError = (error: UIError) => {

            model.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('userinfo', error));
            setState((s) => {
                return {
                    ...s,
                    userInfo: null,
                };
            });
        };

        const options = {
            reload,
            causeError,
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
            {state.userInfo &&
                <div className='text-end mx-auto'>
                    <p className='fw-bold'>{`${state.userInfo.givenName} ${state.userInfo.familyName}`}</p>
                </div>
            }
        </>
    );
}
