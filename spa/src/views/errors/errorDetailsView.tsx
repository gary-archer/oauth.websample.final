import React from 'react';
import {ErrorLine} from '../../plumbing/errors/errorLine';
import {ErrorFormatter} from '../../plumbing/errors/errorFormatter';
import {ErrorDetailsViewProps} from './errorDetailsViewProps';

/*
 * Manages rendering the error detailed view
 */
export function ErrorDetailsView(props: ErrorDetailsViewProps): JSX.Element {

    /*
     * Render a single error line
     */
    function renderErrorLine(line: ErrorLine): JSX.Element {

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
    function renderErrorStack(line: ErrorLine | null): JSX.Element {

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

    const formatter = new ErrorFormatter();
    const lines = formatter.getErrorLines(props.error);
    const stack = formatter.getErrorStack(props.error);

    return  (
        <div className='card border-0'>
            <div className='row'>
                <div className='col-10 errorcolor largetext text-center'>
                    {props.title}
                </div>
                <div className='col-2 text-right'>
                    <button onClick={props.handleClose} type='button'>x</button>
                </div>
            </div>
            <div className='row card-body'>
                <div className='col-12'>
                    <div className='align-items-center mx-auto'>
                        {lines.map((line: any) => renderErrorLine(line))}
                        {renderErrorStack(stack)}
                    </div>
                </div>
            </div>
        </div>
    );
}
