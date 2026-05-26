import {JSX, useEffect, useState} from 'react';
import {EventNames} from '../../plumbing/events/eventNames';
import {NavigatedEvent} from '../../plumbing/events/navigatedEvent';
import {SessionViewProps} from './sessionViewProps';

/*
 * Render the session id used by API logs once data is loaded
 */
export function SessionView(props: SessionViewProps): JSX.Element {

    const text = `API Session Id: ${props.sessionId}`;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    function startup() {
        props.eventBus.on(EventNames.Navigated, onNavigate);
    }

    function cleanup() {
        props.eventBus.detach(EventNames.Navigated, onNavigate);
    }

    /*
     * The session button state becomes disabled when the login required view is active
     */
    function onNavigate(event: NavigatedEvent) {
        setIsVisible(event.isAuthenticatedView);
    }

    return  (
        <>
            {isVisible &&
                <div className='sessionid text-end mx-auto'>
                    <small>{text}</small>
                </div>
            }
        </>
    );
}
