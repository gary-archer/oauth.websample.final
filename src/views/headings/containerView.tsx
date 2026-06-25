import {JSX} from 'react';
import {ContainerViewProps} from './containerViewProps';

/*
 * The container view simply adds some spacing
 */
export function ContainerView({ children }: ContainerViewProps): JSX.Element {

    return  (
        <div className='sm:px-8 md:px-16 lg:px-24 py-2'>
            {children}
        </div>
    );
}
