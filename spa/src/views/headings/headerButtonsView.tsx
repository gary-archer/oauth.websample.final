import React from 'react';
import {HeaderButtonsViewProps} from './headerButtonsViewProps';

/*
 * Render the header buttons
 */
export function HeaderButtonsView(props: HeaderButtonsViewProps): JSX.Element {

    const longPressMilliseconds = 2000;
    let longPressStartTime: number | null = null;

    /*
     * When refresh is clicked, measure the start time
     */
    function handleReloadPress(): void {

        if (!props.sessionButtonsEnabled) {
            return;
        }

        longPressStartTime = Date.now();
    }

    /*
     * The sample uses a long press to simulate an API 500 error, for demonstration purposes
     * Our solutions then demonstrate how it is reported in the UI and looked up via Elastic Search
     */
    function handleReloadRelease(): void {

        if (!props.sessionButtonsEnabled) {
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
    const disabled = !props.sessionButtonsEnabled;
    return  (
        <div className='row'>
            <div className='col col-one-fifth my-2 d-flex p-1'>
                <button
                    onClick={props.handleHomeClick}
                    className='btn btn-primary btn-block p-1'
                >
                    <small>Home</small>
                </button>
            </div>
            <div
                className='col col-one-fifth my-2 d-flex p-1'
                onTouchStart={handleReloadPress}
                onTouchEnd={handleReloadRelease}
                onMouseDown={handleReloadPress}
                onMouseUp={handleReloadRelease}
            >
                <button
                    className='btn btn-primary btn-block p-1'
                    disabled={disabled}
                >
                    <small>Reload Data</small>
                </button>
            </div>
            <div className='col col-one-fifth my-2 d-flex p-1'>
                <button
                    onClick={props.handleExpireAccessTokenClick}
                    className='btn btn-primary btn-block p-1'
                    disabled={disabled}
                >
                    <small>Expire Access Token</small>
                </button>
            </div>
            <div className='col col-one-fifth my-2 d-flex p-1'>
                <button
                    onClick={props.handleExpireRefreshTokenClick}
                    className='btn btn-primary btn-block p-1'
                    disabled={disabled}
                >
                    <small>Expire Refresh Token</small>
                </button>
            </div>
            <div className='col col-one-fifth my-2 d-flex p-1'>
                <button
                    onClick={props.handleLogoutClick}
                    className='btn btn-primary btn-block p-1'
                    disabled={disabled}
                >
                    <small>Logout</small>
                </button>
            </div>
        </div>
    );
}
