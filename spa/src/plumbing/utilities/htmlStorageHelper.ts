/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _prefix = 'finalspa.';
    private static _preLoginLocation = 'preLoginLocation';
    private static _apiSessionKeyName = 'apisessionid';
    private static _loggedOutKeyName = 'loggedout';

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
     * Get the session id for API requests from this browser tab
     */
    public static get apiSessionId(): string {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._apiSessionKeyName}`;
        return sessionStorage.getItem(key) || '';
    }

    /*
     * Get the logged out value from session storage
     */
    public static get loggedOut(): boolean {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._loggedOutKeyName}`;
        return localStorage.getItem(key) === 'true';
    }

    /*
     * Set the logged out value in session storage, used to achieve multi tab logout
     */
    public static set loggedOut(value: boolean) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._loggedOutKeyName}`;
        localStorage.setItem(key, String(value));
    }

    /*
     * This determines if a local storage update to logged out occurred on another browser tab
     */
    public static isLoggedOutEvent(event: StorageEvent): boolean {

        if (event.storageArea === localStorage) {

            const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._loggedOutKeyName}`;
            return event.key === key && event.newValue === 'true';
        }

        return false;
    }
}
