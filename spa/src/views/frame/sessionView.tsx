import React from 'react';
import {SessionManager} from '../../plumbing/utilities/sessionManager';
import {SessionViewProps} from './sessionViewProps';

/*
 * Render the session id used by API logs
 */
export class SessionView extends React.Component<SessionViewProps> {

    private readonly _sessionId: string;

    public constructor(props: SessionViewProps) {
        super(props);
        this._sessionId = SessionManager.get();
    }

    /*
     * Render the session id hen data is loaded and API calls are in effect
     */
    public render(): React.ReactNode {

        if (!this.props.isVisible) {
            return (
                <>
                </>
            );
        }

        return  (
                    <div className='sessionid text-right mx-auto'>
                        <small>{`API Session Id: ${this._sessionId}`}</small>
                    </div>
                );
    }
}
