import React, {useEffect} from 'react';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {HtmlStorageHelper} from '../../plumbing/utilities/htmlStorageHelper';
import {LoginRequiredViewProps} from './loginRequiredViewProps';

/*
 * Render the login required view
 */
export function LoginRequiredView(props: LoginRequiredViewProps): JSX.Element {

    useEffect(() => {
        startup();
    }, []);

    function startup() {
        props.eventBus.emit(EventNames.Navigated, null, new NavigatedEvent(false));
        setTimeout(() => {
            HtmlStorageHelper.clearLoggedOutEvent();
        }, 250);
    }

    return  (
        <>
            <div className='row'>
                <div className='col-12 text-center mx-auto'>
                    <h6>You are signed out - sign in to access the demo app ...</h6>
                </div>
            </div>
        </>
    );
}
