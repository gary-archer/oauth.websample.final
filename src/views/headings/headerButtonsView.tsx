import {JSX, useEffect, useState} from 'react';
import {EventNames} from '../../plumbing/events/eventNames';
import {ViewModelFetchEvent} from '../../plumbing/events/viewModelFetchEvent';
import {HeaderButtonsViewProps} from './headerButtonsViewProps';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';

/*
 * Render the header buttons
 */
export function HeaderButtonsView(props: HeaderButtonsViewProps): JSX.Element {

    const [hasData, setHasData] = useState(false);
    const [homeTitle, setHomeTitle] = useState('Home');

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    function startup() {
        props.eventBus.on(EventNames.ViewModelFetch, onViewModelFetch);
        props.eventBus.on(EventNames.Navigated, onNavigated);
    }

    function cleanup() {
        props.eventBus.detach(EventNames.ViewModelFetch, onViewModelFetch);
        props.eventBus.detach(EventNames.Navigated, onNavigated);
    }

    // Settings related to button long clicks
    const longPressMilliseconds = 2000;
    let longPressStartTime: number | null = null;

    /*
     * The session button state changes when data starts and ends loading
     */
    function onViewModelFetch(event: ViewModelFetchEvent) {
        setHasData(event.getLoaded());
    }

    /*
     * Update different text and buttons depending on whether in an authenticated view
     */
    function onNavigated(event: NavigatedEvent) {

        if (event.isAuthenticatedView) {

            setHomeTitle('Home');

        } else {

            setHomeTitle('Sign In');
            setHasData(false);
        }
    }

    /*
     * When refresh is clicked, measure the start time
     */
    function handleReloadPress(): void {

        if (!hasData) {
            return;
        }

        longPressStartTime = Date.now();
    }

    /*
     * The sample uses a long press to simulate an API 500 error, for demonstration purposes
     * Our solutions then demonstrate how it is reported in the UI and looked up via Elastic Search
     */
    function handleReloadRelease(): void {

        if (!hasData) {
            return;
        }

        if (isLongPress()) {

            // The button has been long pressed which we use as a trigger to simulate an exception
            // causeError = true means the UI to sends a header to the API to instruct it to simulate a 500 error
            props.handleReloadDataClick(true);

        } else {

            // In all other cases we reload data normally
            props.handleReloadDataClick(false);
        }
    }

    /*
     * A utility to calculate whether a long press has occurred
     */
    function isLongPress(): boolean {

        if (!longPressStartTime) {
            return false;
        }

        const timeTaken = Date.now() - longPressStartTime;
        longPressStartTime = null;
        return (timeTaken > longPressMilliseconds);
    }

    /*
     * Render buttons and callback the parent when clicked
     */
    const disabled = hasData ? false : true;
    return  (
        <div className='flex flex-wrap'>
            <div className='w-1/5 p-1 my-3 flex'>
                <button
                    onClick={props.handleHomeClick}
                    className='w-full p-2 bg-blue-600/90 text-white rounded-lg'
                    type='button'
                >
                    {homeTitle}
                </button>
            </div>
            <div
                className='w-1/5 p-1 my-3 flex'
                onTouchStart={handleReloadPress}
                onTouchEnd={handleReloadRelease}
                onMouseDown={handleReloadPress}
                onMouseUp={handleReloadRelease}
            >
                <button
                    className='w-full p-2 bg-blue-600/90 text-white rounded-lg disabled:opacity-50'
                    disabled={disabled}
                    type='button'
                >
                    Reload Data
                </button>
            </div>
            <div className='w-1/5 p-1 my-3 flex'>
                <button
                    onClick={props.handleExpireAccessTokenClick}
                    className='w-full p-2 bg-blue-600/90 text-white rounded-lg disabled:opacity-50'
                    disabled={disabled}
                    type='button'
                >
                    Expire Access Token
                </button>
            </div>
            <div className='w-1/5 p-1 my-3 flex'>
                <button
                    onClick={props.handleExpireRefreshTokenClick}
                    className='w-full p-2 bg-blue-600/90 text-white rounded-lg disabled:opacity-50'
                    disabled={disabled}
                    type='button'
                >
                    Expire Refresh Token
                </button>
            </div>
            <div className='w-1/5 p-1 my-3 flex'>
                <button
                    onClick={props.handleLogoutClick}
                    className='w-full p-2 bg-blue-600/90 text-white rounded-lg disabled:opacity-50'
                    disabled={disabled}
                    type='button'
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
