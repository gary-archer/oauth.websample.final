import React from 'react';
import {EventEmitter} from '../../plumbing/events/eventEmitter';
import {EventNames} from '../../plumbing/events/eventNames';
import {TraceLine} from '../../plumbing/oauth/trace/traceLine';
import {TraceViewState} from './traceViewState';

/*
 * Manages rendering of the overall trace view
 */
export class TraceView extends React.Component<any, TraceViewState> {

    public constructor(props: any) {
        super(props);

        this.state = {
            lines: [],
        };

        this._setupCallbacks();
    }

    /*
     * Render the list of trace lines in our state
     */
    public render(): React.ReactNode {

        return  (
                    <div className='row'>
                        <div className='col-1'>
                            {this.state.lines.length > 0 && this._renderClearButton()}
                        </div>
                        <div className='col-11'>
                            <ul>
                                {this.state.lines.map((line) => this._renderTraceLine(line))}
                            </ul>
                        </div>
                    </div>
                );
    }

    /*
     * Subscribe to trace messages on load
     */
    public componentDidMount(): void {
        EventEmitter.subscribe(EventNames.ON_TRACE, this._receiveTraceLine);
    }

    /*
     * Unsubscribe to trace messages on unload
     */
    public componentWillUnmount(): void {
        EventEmitter.unsubscribe(EventNames.ON_TRACE, this._receiveTraceLine);
    }

    /*
     * The clear button is rendered when there is data to clear
     */
    private _renderClearButton(): React.ReactNode {

        return (
            <div>
                <button onClick={this._handleClearClick}>x</button>
            </div>
        );
    }

    /*
     * Render a single trace line
     */
    private _renderTraceLine(line: TraceLine): React.ReactNode {

        return  (
            <li key={line.id}>
                <span className='font-weight-bold'>{line.prefix}</span>
                {' : '}
                <span>{line.message}</span>
            </li>
        );
    }

    /*
     * Receive a trace line and update state, to cause a render
     */
    private _receiveTraceLine(line: TraceLine): void {

        this.setState((prevState) => {
            return {lines: [...prevState.lines, line]};
        });
    }

    /*
     * Clear data when requested
     */
    private _handleClearClick(): void {
        this.setState({lines: []});
    }

    /*
     * Ensure that the this parameter is available in callbacks
     */
    private _setupCallbacks() {
        this._receiveTraceLine = this._receiveTraceLine.bind(this);
        this._handleClearClick = this._handleClearClick.bind(this);
    }
}
