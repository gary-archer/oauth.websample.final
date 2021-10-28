import React, {useEffect} from 'react';
import {LoginRequiredViewProps} from './loginRequiredViewProps';

/*
 * Render the simple login required view
 */
export function LoginRequiredView(props: LoginRequiredViewProps): JSX.Element {

    useEffect(() => {
        props.onLoading();
    }, []);

    return  (
        <div className='row'>
            <div className='col-12 text-center mx-auto'>
                <h6>
                    You are logged out - click HOME to sign in ...
                </h6>
            </div>
        </div>
    );
}
