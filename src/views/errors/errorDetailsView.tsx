import {JSX} from 'react';
import {ErrorField} from '../../plumbing/errors/errorField';
import {ErrorFormatter} from '../../plumbing/errors/errorFormatter';
import {ErrorDetailsViewProps} from './errorDetailsViewProps';

/*
 * Manages rendering the error detailed view
 */
export function ErrorDetailsView(props: ErrorDetailsViewProps): JSX.Element {

    /*
     * Render a single error field on a line
     */
    function renderErrorField(field: ErrorField): JSX.Element {

        return (
            <div className='grid grid-cols-12 mt-3' key={field.id}>
                <div className='col-span-4'>
                    {field.label}
                </div>
                {field.itemType === 'useraction' &&
                    <div className={'col-span-8 text-green-700 font-bold'}>
                        {field.value}
                    </div>
                }
                {field.itemType === 'value' &&
                    <div className={'col-span-8 text-blue-700 font-bold'}>
                        {field.value}
                    </div>
                }
                {field.itemType === 'identifier' &&
                    <div className={'col-span-8 text-red-700 font-bold'}>
                        {field.value}
                    </div>
                }
            </div>
        );
    }

    /*
     * Render stack trace details in debug builds
     */
    function renderErrorStack(field: ErrorField | null): JSX.Element {

        if (!field) {
            return (
                <>
                </>
            );
        }

        return (
            <>
                <div className='grid grid-cols-12' key={field.id}>
                    <div className='col-span-4'>
                        &nbsp;
                    </div>
                    <div className='col-span-8'>
                        &nbsp;
                    </div>
                </div>
                <div className='grid grid-cols-12' key={field.id + 1}>
                    <div className='col-span-4'>
                        {field.label}
                    </div>
                    <div className='col-span-8'>
                        <span className="text-sm">{field.value}</span>
                    </div>
                </div>
            </>
        );
    }

    // Do the main rendering
    const formatter = new ErrorFormatter();
    const fields = formatter.getErrorFields(props.error);
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
                    {fields.map((line: any) => renderErrorField(line))}
                    {renderErrorStack(stack)}
                </div>
            </div>
        </div>
    );
}
