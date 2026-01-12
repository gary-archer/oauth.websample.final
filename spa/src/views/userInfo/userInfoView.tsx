import {JSX, useEffect, useState} from 'react';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {ReloadDataEvent} from '../../plumbing/events/reloadDataEvent';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ErrorSummaryViewProps} from '../errors/errorSummaryViewProps';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {UserInfoViewProps} from './userInfoViewProps';

/*
 * A simple component to render the logged in user
 */
export function UserInfoView(props: UserInfoViewProps): JSX.Element {

    // Initialize React state from the view model
    const model = props.viewModel;
    const [oauthUserInfo, setOAuthUserInfo] = useState(model.getOAuthUserInfo());
    const [apiUserInfo, setApiUserInfo] = useState(model.getApiUserInfo());
    const [error, setError] = useState(model.getError());

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    /*
     * Subscribe for reload events and then do the initial load of data
     */
    async function startup(): Promise<void> {
        model.getEventBus().on(EventNames.ReloadData, onReload);
        model.getEventBus().on(EventNames.Navigated, onNavigate);
    }

    /*
     * Unsubscribe when we unload
     */
    function cleanup(): void {
        model.getEventBus().detach(EventNames.ReloadData, onReload);
        model.getEventBus().detach(EventNames.Navigated, onNavigate);
    }

    /*
     * Load or unload data based on navigation events
     */
    async function onNavigate(event: NavigatedEvent): Promise<void> {

        if (!event.isAuthenticatedView) {
            unloadData();
        } else {
            await loadData();
        }
    }

    /*
     * Process the reload event
     */
    function onReload(event: ReloadDataEvent): void {

        const options = {
            forceReload: true,
            causeError: event.getCauseError(),
        };
        loadData(options);
    }

    /*
     * Get a name string using OAuth user info
     */
    function getUserNameForDisplay(): string {

        if (oauthUserInfo) {
            return `${oauthUserInfo.givenName} ${oauthUserInfo.familyName}`;
        }

        return '';
    }

    /*
     * Show the user's title when the name is clicked
     */
    function getUserTitle(): string {
        return apiUserInfo?.title || '';
    }

    /*
     * Show the user's regions when the name is clicked
     */
    function getUserRegions(): string {

        if (!apiUserInfo?.regions || apiUserInfo.regions.length == 0) {
            return '';
        }

        const regions = apiUserInfo.regions.join(', ');
        return `[${regions}]`;
    }

    /*
     * Ask the model to load data, then update state
     */
    async function loadData(options?: ViewLoadOptions): Promise<void> {

        await model.callApi(options);
        setOAuthUserInfo(model.getOAuthUserInfo());
        setApiUserInfo(model.getApiUserInfo());
        setError(model.getError());
    }

    /*
     * Ask the model to unload data, then update state
     */
    function unloadData(): void {

        model.unload();
        setOAuthUserInfo(model.getOAuthUserInfo());
        setApiUserInfo(model.getApiUserInfo());
        setError(model.getError());
    }

    function getErrorProps(): ErrorSummaryViewProps {

        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        return {
            error: error!,
            errorsToIgnore: [ErrorCodes.loginRequired],
            containingViewName: 'userinfo',
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'User Info Error',
            centred: false,
        };
    }

    return (
        <>
            {error &&
                <div className='text-end mx-auto'>
                    <ErrorSummaryView {...getErrorProps()}/>
                </div>
            }
            {oauthUserInfo && apiUserInfo &&
                <div className='text-end mx-auto'>
                    <div className='fw-bold basictooltip'>{getUserNameForDisplay()}
                        <div className='basictooltiptext'>
                            <small>{getUserTitle()}</small>
                            <br />
                            <small>{getUserRegions()}</small>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}
