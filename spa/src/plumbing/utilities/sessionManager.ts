import {HtmlStorageHelper} from './htmlStorageHelper';

/*
 * A custom session id header is added on each API call that is included in API logs
 */
export class SessionManager {

    /*
     * Create the session when the browser tab is first created
     */
    public static get(): string {

        let sessionId = HtmlStorageHelper.getApiSessionId();
        if (!sessionId) {

            sessionId = crypto.randomUUID();
            HtmlStorageHelper.setApiSessionId(sessionId);
        }

        return sessionId;
    }
}
