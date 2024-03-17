/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _prefix = 'finalspa.';
    private static _preLoginLocation = 'preLoginLocation';
    private static _apiSessionKeyName = 'apisessionid';
    private static _csrfToken = 'csrfToken';
    private static _loggedOutEventKeyName = 'loggedoutEvent';

    /*
     * Store the app location before triggering a login redirect
     */
    public static set preLoginLocation(location: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._preLoginLocation}`;
        sessionStorage.setItem(key, location);
    }

    /*
     * Get any stored app state when handling login responses
     */
    public static getAndRemovePreLoginLocation(): string | null {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._preLoginLocation}`;
        const data = sessionStorage.getItem(key);
        if (data) {
            sessionStorage.removeItem(key);
            return data;
        }

        return null;
    }

    /*
     * Record a session id to be sent to the API for requests from this browser tab
     */
    public static set apiSessionId(value: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._apiSessionKeyName}`;
        sessionStorage.setItem(key, value);
    }

    /*
     * Get the CSRF token, sent with data changing API requests
     */
    public static get csrfToken(): string {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._csrfToken}`;
        return localStorage.getItem(key) || '';
    }

    /*
     * Set the CSRF token, sent with data changing API requests
     */
    public static set csrfToken(value: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._csrfToken}`;
        localStorage.setItem(key, value);
    }

    /*
     * Clear the CSRF token, sent with data changing API requests
     */
    public static clearAntiForgeryToken(): void {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._csrfToken}`;
        localStorage.removeItem(key);
    }

    /*
     * Get the session id for API requests from this browser tab
     */
    public static get apiSessionId(): string {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._apiSessionKeyName}`;
        return sessionStorage.getItem(key) || '';
    }

    /*
     * Raise the logged out value to local storage, to enable multi tab logout
     */
    public static raiseLoggedOutEvent(): void {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._loggedOutEventKeyName}`;
        localStorage.setItem(key, 'raised');
    }

    /*
     * This determines if a local storage update to logged out occurred on another browser tab
     */
    public static isLoggedOutEvent(event: StorageEvent): boolean {

        if (event.storageArea === localStorage) {

            const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._loggedOutEventKeyName}`;
            return event.key === key && event.newValue === 'raised';
        }

        return false;
    }

    /*
     * Clear the event data from local storage
     */
    public static clearLoggedOutEvent(): void {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._loggedOutEventKeyName}`;
        localStorage.removeItem(key);
    }
}
