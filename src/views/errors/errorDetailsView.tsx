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
            <div className='grid grid-cols-12 mt-3' key={line.id}>
                <div className='col-span-4'>
                    {line.label}
                </div>
                {line.itemType === 'useraction' &&
                    <div className={'col-span-8 text-green-700 font-bold'}>
                        {line.value}
                    </div>
                }
                {line.itemType === 'value' &&
                    <div className={'col-span-8 text-blue-700 font-bold'}>
                        {line.value}
                    </div>
                }
                {line.itemType === 'error' &&
                    <div className={'col-span-8 text-red-700 font-bold'}>
                        {line.value}
                    </div>
                }
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
                        <span className="text-sm">{line.value}</span>
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
        <div className='bg-white rounded-lg'>
            <div className='grid grid-cols-12'>
                <div className='col-span-10 text-red-600 text-2xl text-center'>
                    {props.title}
                </div>
                <div className='col-span-2 text-right'>
                    <button onClick={props.handleClose} type='button'>x</button>
                </div>
            </div>
            <div className='mt-5'>
                <div className='items-center mx-auto'>
                    {lines.map((line: any) => renderErrorLine(line))}
                    {renderErrorStack(stack)}
                </div>
            </div>
        </div>
    );
}
