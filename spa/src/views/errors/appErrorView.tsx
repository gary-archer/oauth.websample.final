import React from 'react';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {EventEmitter} from '../../plumbing/events/eventEmitter';
import {EventNames} from '../../plumbing/events/eventNames';
import {AppErrorState} from './appErrorState';
import {ErrorSummaryView} from './errorSummaryView';

/*
 * Manages rendering of application level errors, such as those during startup or login
 */
export class AppErrorView extends React.Component<any, AppErrorState> {

    public constructor(props: any) {
        super(props);

        this.state = {
            area: '',
            error: null,
        };

        this._setupCallbacks();
    }

    /*
     * Render the error hyperlink, and show the modal dialog when the user selects it
     */
    public render(): React.ReactNode {

        if (!this.state.error) {
            return  (
                <>
                </>
            );
        }

        const errorProps = {
            hyperlinkMessage: `${this.state.area} Problem Encountered`,
            dialogTitle: `${this.state.area} Error`,
            error: this.state.error,
        };

        return (
            <div className='row'>
                <div className='col-6 text-center mx-auto'>
                    <ErrorSummaryView {...errorProps}/>
                </div>
            </div>
        );
    }

    /*
     * Load data then listen for the reload event
     */
    public async componentDidMount(): Promise<void> {
        EventEmitter.subscribe(EventNames.error, this._receiveError);
    }

    /*
     * Unsubscribe when we unload
     */
    public async componentWillUnmount(): Promise<void> {
        EventEmitter.unsubscribe(EventNames.error, this._receiveError);
    }

    /*
     * Update state when an error is received
     */
    private _receiveError(data: any): void {

        const error = ErrorHandler.getFromException(data.error);
        this.setState({area: data.area, error});
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._receiveError = this._receiveError.bind(this);
    }
}
