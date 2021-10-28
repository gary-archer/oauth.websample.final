import React from 'react';
import {SessionManager} from '../../plumbing/utilities/sessionManager';
import {SessionViewProps} from './sessionViewProps';

/*
 * Render the session id used by API logs once data is loaded
 */
export function SessionView(props: SessionViewProps): JSX.Element {

    const sessionId = SessionManager.get();

    if (!props.isVisible) {
        return (
            <>
            </>
        );
    }

    return  (
        <div className='sessionid text-right mx-auto'>
            <small>{`API Session Id: ${sessionId}`}</small>
        </div>
    );
}
