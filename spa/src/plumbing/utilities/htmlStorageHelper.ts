/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static prefix = 'finalspa.';
    private static preLoginLocation = 'preLoginLocation';
    private static apiSessionKeyName = 'apisessionid';
    private static isLoggedIn = 'isLoggedIn';
    private static loggedOutEventKeyName = 'loggedoutEvent';

    /*
     * Store the app location before triggering a login redirect
     */
    public static setPreLoginLocation(location: string): void {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.preLoginLocation}`;
        sessionStorage.setItem(key, location);
    }

    /*
     * Get any stored app state when handling login responses
     */
    public static getAndRemovePreLoginLocation(): string | null {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.preLoginLocation}`;
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
    public static setApiSessionId(value: string): void {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.apiSessionKeyName}`;
        sessionStorage.setItem(key, value);
    }

    /*
     * Check whether logged in
     */
    public static getIsLoggedIn(): boolean {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.isLoggedIn}`;
        return localStorage.getItem(key) == 'true';
    }

    /*
     * Set whether logged in, to prevent extra calls to the OAuth Agent when we open a new browser tab
     */
    public static setIsLoggedIn(value: boolean): void {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.isLoggedIn}`;
        localStorage.setItem(key, String(value));
    }

    /*
     * Clear the isLoggedIn flag when we log out
     */
    public static clearIsLoggedIn(): void {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.isLoggedIn}`;
        localStorage.removeItem(key);
    }

    /*
     * Get the session id for API requests from this browser tab
     */
    public static getApiSessionId(): string {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.apiSessionKeyName}`;
        return sessionStorage.getItem(key) || '';
    }

    /*
     * Raise the logged out value to local storage, to enable multi tab logout
     */
    public static raiseLoggedOutEvent(): void {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.loggedOutEventKeyName}`;
        localStorage.setItem(key, 'raised');
    }

    /*
     * This determines if a local storage update to logged out occurred on another browser tab
     */
    public static isLoggedOutEvent(event: StorageEvent): boolean {

        if (event.storageArea === localStorage) {

            const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.loggedOutEventKeyName}`;
            return event.key === key && event.newValue === 'raised';
        }

        return false;
    }

    /*
     * Clear the event data from local storage
     */
    public static clearLoggedOutEvent(): void {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.loggedOutEventKeyName}`;
        localStorage.removeItem(key);
    }
}
