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

        const formatter = new ErrorFormatter();
        const lines = formatter.getErrorLines(this.props.error);
        const stack = formatter.getErrorStack(this.props.error);

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
                                    {this._renderErrorStack(stack)}
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
                    {line.label}
                </div>
                <div className={`col-8 ${line.valueStyle} font-weight-bold`}>
                    {line.value}
                </div>
            </div>
        );
    }

    /*
     * Render stack trace details in debug builds
     */
    private _renderErrorStack(line: ErrorLine | null): React.ReactNode {

        if (!line) {
            return (
                <>
                </>
            );
        }

        return (
            <>
                <div className='row' key={line.id}>
                    <div className='col-4'>
                        &nbsp;
                    </div>
                    <div className='col-8'>
                        &nbsp;
                    </div>
                </div>
                <div className='row' key={line.id + 1}>
                    <div className='col-4'>
                        {line.label}
                    </div>
                    <div className='col-8 small'>
                        {line.value}
                    </div>
                </div>
            </>
        );
    }
}
