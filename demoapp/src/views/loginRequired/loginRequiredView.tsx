import React, {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigateEvent} from '../../plumbing/events/navigateEvent';
import {CurrentLocation} from '../utilities/currentLocation';
import {LoginRequiredViewProps} from './loginRequiredViewProps';

/*
 * Render the simple login required view
 */
export function LoginRequiredView(props: LoginRequiredViewProps): JSX.Element {

    useEffect(() => {

        // Inform other parts of the app that the main view is not active
        props.eventBus.emit(EventNames.Navigate, null, new NavigateEvent(false));

    }, []);

    CurrentLocation.path = useLocation().pathname;

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
