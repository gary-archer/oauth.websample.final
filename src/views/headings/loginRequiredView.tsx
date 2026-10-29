import {JSX, useEffect} from 'react';
import {EventNames} from '../../events/eventNames';
import {NavigatedEvent} from '../../events/navigatedEvent';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
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
            <div className='text-lg text-center'>
                You are signed out - sign in to access the app ...
            </div>
        </>
    );
}
