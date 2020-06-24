import React from 'react';
import {ErrorLine} from '../../plumbing/errors/errorLine';
import {ErrorFormatter} from '../../plumbing/errors/errorFormatter';
import {ErrorDetailsViewProps} from './errorDetailsViewProps';

/*
 * Manages rendering the error detailed view
 */
export class ErrorDetailsView extends React.Component<ErrorDetailsViewProps> {

    public constructor(props: any) {
        super(props);
    }

    /*
     * Output the error if it exists
     */
    public render(): React.ReactNode {

        const lines = ErrorFormatter.getErrorLines(this.props.error);
        return  (
                    <div className='card border-0'>
                        <div className='row'>
                            <div className='col-10 errorcolor largetext text-center'>
                                    {this.props.title}
                            </div>
                            <div className='col-2 text-right'>
                                <button onClick={this.props.handleClose} type='button'>x</button>
                            </div>
                        </div>
                        <div className='row card-body'>
                            <div className='col-12'>
                                <div className='align-items-center mx-auto'>
                                    {lines.map((line: any) => this._renderErrorLine(line))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
    }

    /*
     * Render a single error line
     */
    private _renderErrorLine(line: ErrorLine): React.ReactNode {

        return (
            <div className='row' key={line.id}>
                <div className='col-4'>
                    {line.title}
                </div>
                {this._renderErrorLineValue(line)}
            </div>
        );
    }

    /*
     * Highlight the looked up error id in red
     */
    private _renderErrorLineValue(line: ErrorLine): React.ReactNode {

        if (line.title === 'Id') {
            return (
                <div className='col-8 errorcolor font-weight-bold'>
                    {line.value}
                </div>
            );
        }

        return (
            <div className='col-8 valuecolor font-weight-bold'>
                {line.value}
            </div>
        );
    }
}
