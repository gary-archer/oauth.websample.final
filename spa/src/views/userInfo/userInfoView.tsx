import React, {useEffect, useState} from 'react';
import {UserInfo} from '../../api/entities/userInfo';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {ReloadUserInfoEvent} from '../../plumbing/events/reloadUserInfoEvent';
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
        error: null,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    /*
     * Subscribe to events and then do the initial load of data
     */
    async function startup(): Promise<void> {
        model.eventBus.on(EventNames.Navigate, onNavigate);
        model.eventBus.on(EventNames.ReloadUserInfo, onReload);
    }

    /*
     * Unsubscribe when we unload
     */
    function cleanup(): void {
        model.eventBus.detach(EventNames.Navigate, onNavigate);
        model.eventBus.detach(EventNames.ReloadUserInfo, onReload);
    }

    /*
     * Load data when in a main view
     */
    async function onNavigate(event: NavigateEvent): Promise<void> {

        if (event.isMainView) {

            // Load user data the first time
            await loadData();

        } else {

            // If in the login required view we clear user data
            model.unload();
            setState((s) => {
                return {
                    ...s,
                    userInfo: null,
                    error: null,
                };
            });
        }
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
                    error: null,
                };
            });
        };

        const onError = (error: UIError) => {
            setState((s) => {
                return {
                    ...s,
                    userInfo: null,
                    error,
                };
            });
        };

        const options = {
            reload,
            causeError,
        };

        model.callApi(onSuccess, onError, options);
    }

    // Render errors if there are technical problems getting user info
    if (state.error && state.error.errorCode !== ErrorCodes.loginRequired) {

        const errorProps = {
            containingViewName: 'userinfo',
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'User Info Error',
            centred: false,
        };
        return (
            <div className='text-right mx-auto'>
                <ErrorSummaryView {...errorProps}/>
            </div>
        );
    }

    // Render user info otherwise
    return (
        <>
            {state.userInfo &&
                <div className='text-right mx-auto'>
                    <p className='font-weight-bold'>{`${state.userInfo.givenName} ${state.userInfo.familyName}`}</p>
                </div>
            }
        </>
    );
}
