/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _loginAppCurrentPath = 'login.appcurrentpath';
    private static _loggedOutState = 'loggedout.state';
    private static _apiSessionKeyName = 'session.id';

    /*
     * When processing the login response, get and remove the stored current path
     */
    public static getAndRemoveLoginAppCurrentPath(): string {

        const key = HtmlStorageHelper._loginAppCurrentPath;
        const result = sessionStorage.getItem(key) || '';
        sessionStorage.removeItem(key);
        return result;
    }

    /*
     * Set the logged out value in session storage, used to achieve multi tab logout
     */
    public static set loggedOut(value: boolean) {

        const key = HtmlStorageHelper._loggedOutState;
        localStorage.setItem(key, String(value));
    }

    /*
     * Get the session id for API requests from this browser tab
     */
    public static get apiSessionId(): string {

        const key = HtmlStorageHelper._apiSessionKeyName;
        return sessionStorage.getItem(key) || '';
    }

    /*
     * Record a session id to be sent to the API for requests from this browser tab
     */
    public static set apiSessionId(value: string) {

        const key = HtmlStorageHelper._apiSessionKeyName;
        sessionStorage.setItem(key, value);
    }
}
