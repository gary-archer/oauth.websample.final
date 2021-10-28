import React, {useEffect, useState} from 'react';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {EventEmitter} from '../../plumbing/events/eventEmitter';
import {EventNames} from '../../plumbing/events/eventNames';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ApiViewNames} from '../utilities/apiViewNames';
import {UserInfoViewProps} from './userInfoViewProps';
import {UserInfoViewState} from './userInfoViewState';

/*
 * A simple component to render the logged in user
 */
export function UserInfoView(props: UserInfoViewProps): JSX.Element {

    // Initialise state and ensure that the error is the expected type for display
    const shouldLoad = props.shouldLoad;
    const [state, setState] = useState<UserInfoViewState>({
        userInfo: null,
        error: null,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, [shouldLoad]);

    /*
     * Load data then listen for the reload event
     */
    async function startup(): Promise<void> {

        EventEmitter.subscribe(EventNames.ON_RELOAD_USERINFO, loadData);
        await loadData(false);
    }

    /*
     * Unsubscribe when we unload
     */
    function cleanup(): void {
        EventEmitter.unsubscribe(EventNames.ON_RELOAD_USERINFO, loadData);
    }

    /*
     * Load data when requested
     */
    async function loadData(causeError: boolean): Promise<void> {

        try {

            // We do not load when the logged out view is active
            if (!shouldLoad) {
                props.events.onViewLoaded(ApiViewNames.UserInfo);
                return;
            }

            setState((s) => {
                return {
                    ...s,
                    error: null,
                };
            });

            // Get user info
            props.events.onViewLoading(ApiViewNames.UserInfo);
            const userInfo = await props.apiClient.getUserInfo({causeError});
            props.events.onViewLoaded(ApiViewNames.UserInfo);

            setState((s) => {
                return {
                    ...s,
                    userInfo,
                };
            });

        } catch (e) {

            const error = ErrorHandler.getFromException(e);
            setState((s) => {
                return {
                    ...s,
                    userInfo: null,
                    error,
                };
            });
            props.events.onViewLoadFailed(ApiViewNames.UserInfo, error);
        }
    }

    // Render errors if there are technical problems getting user info
    if (state.error && state.error.errorCode !== ErrorCodes.loginRequired) {

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'User Info Error',
            error: state.error,
            centred: false,
        };
        return (
            <div className='text-right mx-auto'>
                <ErrorSummaryView {...errorProps}/>
            </div>
        );
    }

    // Render nothing when logged out
    if (!shouldLoad || !state.userInfo) {
        return (
            <>
            </>
        );
    }

    // Render the logged in user name otherwise
    const name = `${state.userInfo.givenName} ${state.userInfo.familyName}`;
    return state.userInfo &&
        (
            <div className='text-right mx-auto'>
                <p className='font-weight-bold'>{name}</p>
            </div>
        );
}
