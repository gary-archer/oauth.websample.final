import React, {useEffect} from 'react';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {LoginRequiredViewProps} from './loginRequiredViewProps';

/*
 * Render the simple login required view
 */
export function LoginRequiredView(props: LoginRequiredViewProps): JSX.Element {

    useEffect(() => {

        // Inform other parts of the app that the main view is not active
        props.eventBus.emit(EventNames.Navigate, null, new NavigateEvent(false));

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
