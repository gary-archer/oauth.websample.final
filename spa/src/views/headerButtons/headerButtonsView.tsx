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

        const disabled = !this.props.sessionButtonsEnabled;
        return  (
                <div className='row'>
                    <div className='col-3 my-2 d-flex'>
                        <button
                            onClick={this.props.handleHomeClick}
                            className='btn btn-primary btn-block p-1'
                        >
                            Home
                        </button>
                    </div>
                    <div className='col-3 my-2 d-flex'>
                        <button
                            onClick={this.props.handleExpireAccessTokenClick}
                            className='btn btn-primary btn-block p-1'
                            disabled={disabled}
                        >
                            Expire Token
                        </button>
                    </div>
                    <div
                        className='col-3 my-2 d-flex'
                        onTouchStart={this._handleRefreshPress}
                        onTouchEnd={this._handleRefreshRelease}
                        onMouseDown={this._handleRefreshPress}
                        onMouseUp={this._handleRefreshRelease}
                    >
                        <button
                            className='btn btn-primary btn-block p-1'
                            disabled={disabled}
                        >
                            Refresh Data
                        </button>
                    </div>
                    <div className='col-3 my-2 d-flex'>
                        <button
                            onClick={this.props.handleLogoutClick}
                            className='btn btn-primary btn-block p-1'
                            disabled={disabled}
                        >
                            Logout
                        </button>
                    </div>
                </div>
        );
    }

    /*
     * When refresh is clicked, measure the start time
     */
    private _handleRefreshPress(): void {

        if (!this.props.sessionButtonsEnabled) {
            return;
        }

        this._longPressStartTime = Date.now();
    }

    /*
     * The sample uses a long press to simulate an API 500 error, for demonstration purposes
     * Our solutions then demonstrate how it is reported in the UI and looked up via Elastic Search
     */
    private _handleRefreshRelease(): void {

        if (!this.props.sessionButtonsEnabled) {
            return;
        }

        if (this._isLongPress()) {

            // The button has been long pressed which we use as a trigger to simulate an exception
            // causeError = true means the UI to sends a header to the API to instruct it to simulate a 500 error
            this.props.handleRefreshDataClick(true);

        } else {

            // In all other cases we refresh data normally
            this.props.handleRefreshDataClick(false);
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
        this._handleRefreshPress = this._handleRefreshPress.bind(this);
        this._handleRefreshRelease = this._handleRefreshRelease.bind(this);
    }
}
