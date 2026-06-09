import {JSX} from 'react';
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
            <div className='grid grid-cols-12' key={line.id}>
                <div className='col-span-4'>
                    {line.label}
                </div>
                <div className={`col-span-8 ${line.valueStyle} font-bold`}>
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
                <div className='grid grid-cols-12' key={line.id}>
                    <div className='col-span-4'>
                        &nbsp;
                    </div>
                    <div className='col-span-8'>
                        &nbsp;
                    </div>
                </div>
                <div className='grid grid-cols-12' key={line.id + 1}>
                    <div className='col-span-4'>
                        {line.label}
                    </div>
                    <div className='col-span-8'>
                        {line.value}
                    </div>
                </div>
            </>
        );
    }

    // Do the main rendering
    const formatter = new ErrorFormatter();
    const lines = formatter.getErrorLines(props.error);
    const stack = formatter.getErrorStack(props.error);

    return  (
        <div className='bg-white rounded-lg shadow-sm'>
            <div className='grid grid-cols-12'>
                <div className='col-span-10 text-red-600 text-xl text-center'>
                    {props.title}
                </div>
                {props.handleClose && <div className='col-span-2 text-right'>
                    <button onClick={props.handleClose} type='button'>x</button>
                </div>}
            </div>
            <div className='grid grid-cols-12'>
                <div className='col-span-12'>
                    <div className='items-center mx-auto'>
                        {lines.map((line: any) => renderErrorLine(line))}
                        {renderErrorStack(stack)}
                    </div>
                </div>
            </div>
        </div>
    );
}
