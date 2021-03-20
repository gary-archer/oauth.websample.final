import React from 'react';
import {HeaderButtonsViewProps} from './headerButtonsViewProps';

/*
 * Render the header buttons
 */
export class HeaderButtonsView extends React.Component<HeaderButtonsViewProps> {

    private _longPressStartTime: number | null;
    private readonly _longPressMilliseconds: number;

    public constructor(props: HeaderButtonsViewProps) {
        super(props);

        this._longPressStartTime = null;
        this._longPressMilliseconds = 2000;
        this._setupCallbacks();
    }

    /*
     * Render buttons and callback the parent when clicked
     */
    public render(): React.ReactNode {

        if (this.props.usesRefreshTokens) {
            return this._renderAllButtons();
        } else {
            return this._renderStandardButtons();
        }
    }

    /*
     * Render all buttons including that to expire the refresh token
     */
    private _renderAllButtons(): React.ReactNode {

        const disabled = !this.props.sessionButtonsEnabled;
        return  (
            <div className='row'>
                <div className='col col-one-fifth my-2 d-flex p-1'>
                    <button
                        onClick={this.props.handleHomeClick}
                        className='btn btn-primary btn-block p-1'
                    >
                        <small>Home</small>
                    </button>
                </div>
                <div
                    className='col col-one-fifth my-2 d-flex p-1'
                    onTouchStart={this._handleReloadPress}
                    onTouchEnd={this._handleReloadRelease}
                    onMouseDown={this._handleReloadPress}
                    onMouseUp={this._handleReloadRelease}
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
                        onClick={this.props.handleExpireAccessTokenClick}
                        className='btn btn-primary btn-block p-1'
                        disabled={disabled}
                    >
                        <small>Expire Access Token</small>
                    </button>
                </div>
                <div className='col col-one-fifth my-2 d-flex p-1'>
                    <button
                        onClick={this.props.handleExpireRefreshTokenClick}
                        className='btn btn-primary btn-block p-1'
                        disabled={disabled}
                    >
                        <small>Expire Refresh Token</small>
                    </button>
                </div>
                <div className='col col-one-fifth my-2 d-flex p-1'>
                    <button
                        onClick={this.props.handleLogoutClick}
                        className='btn btn-primary btn-block p-1'
                        disabled={disabled}
                    >
                        <small>Logout</small>
                    </button>
                </div>
            </div>
        );
    }

    /*
     * Render buttons when the SPA is using 'standard mode', with only an access token
     */
    private _renderStandardButtons(): React.ReactNode {

        const disabled = !this.props.sessionButtonsEnabled;
        return  (
            <div className='row'>
                <div className='col col-3 my-2 d-flex p-1'>
                    <button
                        onClick={this.props.handleHomeClick}
                        className='btn btn-primary btn-block p-1'
                    >
                        <small>Home</small>
                    </button>
                </div>
                <div
                    className='col col-3 my-2 d-flex p-1'
                    onTouchStart={this._handleReloadPress}
                    onTouchEnd={this._handleReloadRelease}
                    onMouseDown={this._handleReloadPress}
                    onMouseUp={this._handleReloadRelease}
                >
                    <button
                        className='btn btn-primary btn-block p-1'
                        disabled={disabled}
                    >
                        <small>Reload Data</small>
                    </button>
                </div>
                <div className='col col-3 my-2 d-flex p-1'>
                    <button
                        onClick={this.props.handleExpireAccessTokenClick}
                        className='btn btn-primary btn-block p-1'
                        disabled={disabled}
                    >
                        <small>Expire Access Token</small>
                    </button>
                </div>
                <div className='col col-3 my-2 d-flex p-1'>
                    <button
                        onClick={this.props.handleLogoutClick}
                        className='btn btn-primary btn-block p-1'
                        disabled={disabled}
                    >
                        <small>Logout</small>
                    </button>
                </div>
            </div>
        );
    }

    /*
     * When refresh is clicked, measure the start time
     */
    private _handleReloadPress(): void {

        if (!this.props.sessionButtonsEnabled) {
            return;
        }

        this._longPressStartTime = Date.now();
    }

    /*
     * The sample uses a long press to simulate an API 500 error, for demonstration purposes
     * Our solutions then demonstrate how it is reported in the UI and looked up via Elastic Search
     */
    private _handleReloadRelease(): void {

        if (!this.props.sessionButtonsEnabled) {
            return;
        }

        if (this._isLongPress()) {

            // The button has been long pressed which we use as a trigger to simulate an exception
            // causeError = true means the UI to sends a header to the API to instruct it to simulate a 500 error
            this.props.handleReloadDataClick(true);

        } else {

            // In all other cases we reload data normally
            this.props.handleReloadDataClick(false);
        }
    }

    /*
     * A utility to calculate whether a long press has occurred
     */
    private _isLongPress(): boolean {

        if (!this._longPressStartTime) {
            return false;
        }

        const timeTaken = Date.now() - this._longPressStartTime;
        this._longPressStartTime = null;
        return (timeTaken > this._longPressMilliseconds);
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._handleReloadPress = this._handleReloadPress.bind(this);
        this._handleReloadRelease = this._handleReloadRelease.bind(this);
    }
}
