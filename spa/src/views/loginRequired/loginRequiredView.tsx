import React, {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {CurrentLocation} from '../utilities/currentLocation';
import {LoginRequiredViewProps} from './loginRequiredViewProps';

/*
 * Render the login required view
 */
export function LoginRequiredView(props: LoginRequiredViewProps): JSX.Element {

    useEffect(() => {
        startup();
    }, []);

    CurrentLocation.path = useLocation().pathname;

    function startup() {
        props.eventBus.emit(EventNames.Navigated, null, new NavigatedEvent(false));
    }

    return  (
        <>
            <div className='row'>
                <div className='col-12 text-center mx-auto'>
                    <h6>You are logged out - click HOME to sign in ...</h6>
                </div>
            </div>
        </>
    );
}
