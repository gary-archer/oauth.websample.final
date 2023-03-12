/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _loginAppCurrentPath = 'login.appcurrentpath';
    private static _loggedOutState = 'loggedout.state';
    private static _apiSessionKeyName = 'session.id';

    /*
     * Store the app's current path, to enable deep linking after login
     */
    public static set loginAppCurrentPath(currentPath: string) {

        const key = HtmlStorageHelper._loginAppCurrentPath;
        sessionStorage.setItem(key, currentPath);
    }

    /*
     * Get the logged out value from local storage, which is shared across all browser tabs
     */
    public static get loggedOut(): boolean {

        const key = HtmlStorageHelper._loggedOutState;
        return localStorage.getItem(key) === 'true';
    }

    /*
     * This determines if a local storage update to logged out occurred on another browser tab
     */
    public static isLoggedOutEvent(event: StorageEvent): boolean {

        if (event.storageArea === localStorage) {

            const key = HtmlStorageHelper._loggedOutState;
            return event.key === key && event.newValue === 'true';
        }

        return false;
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
