import React from 'react';
import {SessionViewProps} from './sessionViewProps';

/*
 * Render the session id used by API logs once data is loaded
 */
export function SessionView(props: SessionViewProps): JSX.Element {

    return  (
        <div className='sessionid text-end mx-auto'>
            <small>{`API Session Id: ${props.sessionId}`}</small>
        </div>
    );
}
