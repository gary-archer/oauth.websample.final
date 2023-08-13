import React from 'react';
import {LoginRequiredProps} from './loginRequiredProps';

/*
 * The login required handler simply displays a user message and provides a login button
 */
export function LoginRequiredHandler(props: LoginRequiredProps): JSX.Element {

    if (props.hasError) {
        return (
            <>
            </>
        );
    }

    const userMessage = props.isAfterLogout ? 'You have been logged out' : 'Welcome back';
    return  (
        <>
            <div className='row'>
                <div className='col-12 text-center mx-auto'>
                    <h6>{userMessage}</h6>
                </div>
            </div>
            <div className='row'>
                <div className='col col-one-fifth d-flex p-1'></div>
                <div className='col col-one-fifth d-flex p-1'></div>
                <div className='col col-one-fifth d-flex p-1'>
                    <button
                        onClick={props.onLogin}
                        type='button'
                        className='btn btn-primary w-100 p-1'>Login</button>
                </div>
                <div className='col col-one-fifth d-flex p-1'></div>
                <div className='col col-one-fifth d-flex p-1'></div>
            </div>
        </>
    );
}
