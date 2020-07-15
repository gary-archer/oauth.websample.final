import {Guid} from 'guid-typescript';

/*
 * A custom session id header is added on each API call that is included in API logs
 */
export class SessionManager {

    /*
     * Create the session when the browser tab is first created
     */
    public static get(): string {

        const key = 'apiSessionId';
        let sessionId = localStorage.getItem(key);
        if (!sessionId) {

            sessionId = Guid.create().toString();
            localStorage.setItem(key, sessionId);
        }

        return sessionId;
    }
}
