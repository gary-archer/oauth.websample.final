import React, {useEffect, useState} from 'react';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {ReloadUserInfoEvent} from '../../plumbing/events/reloadUserInfoEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ApiViewNames} from '../utilities/apiViewNames';
import {RouteHelper} from '../utilities/routeHelper';
import {UserInfoViewProps} from './userInfoViewProps';
import {UserInfoViewState} from './userInfoViewState';

/*
 * A simple component to render the logged in user
 */
export function UserInfoView(props: UserInfoViewProps): JSX.Element {

    const model = props.viewModel;
    const [state, setState] = useState<UserInfoViewState>({
        shouldLoad: !RouteHelper.isInLoggedOutView(),
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
        await loadData(false);
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
    function onNavigate(event: NavigateEvent): void {
        setState((s) => {
            return {
                ...s,
                shouldLoad: event.isMainView,
            };
        });
    }

    /*
     * Receive the reload event
     */
    function onReload(event: ReloadUserInfoEvent): void {
        loadData(event.causeError);
    }

    /*
     * Load data when requested
     */
    async function loadData(causeError: boolean): Promise<void> {

        try {

            // We do not load when the logged out view is active
            if (!state.shouldLoad) {
                model.apiViewEvents.onViewLoaded(ApiViewNames.UserInfo);
                return;
            }

            setState((s) => {
                return {
                    ...s,
                    error: null,
                };
            });

            // Get user info
            model.apiViewEvents.onViewLoading(ApiViewNames.UserInfo);
            const userInfo = await model.apiClient.getUserInfo({causeError});
            model.apiViewEvents.onViewLoaded(ApiViewNames.UserInfo);

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
            model.apiViewEvents.onViewLoadFailed(ApiViewNames.UserInfo, error);
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
    if (!state.shouldLoad || !state.userInfo) {
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
