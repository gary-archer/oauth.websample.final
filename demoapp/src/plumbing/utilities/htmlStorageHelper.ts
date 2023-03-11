/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _loginState = 'login.state';
    private static _loggedOutState = 'logout.state';
    private static _apiSessionKeyName = 'session.id';

    /*
     * Store app state before triggering a login redirect
     */
    public static set loginState(data: any) {

        const key = HtmlStorageHelper._loginState;
        sessionStorage.setItem(key, JSON.stringify(data));
    }

    /*
     * Get any stored app state when handling login responses
     */
    public static get loginState(): any {

        const key = HtmlStorageHelper._loginState;
        const data = sessionStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }

        return {};
    }

    /*
     * Clean up login state
     */
    public static removeLoginState(): void {

        const key = HtmlStorageHelper._loginState;
        sessionStorage.removeItem(key);
    }

    /*
     * Get the logged out value from session storage
     */
    public static get loggedOut(): boolean {

        const key = HtmlStorageHelper._loggedOutState;
        return localStorage.getItem(key) === 'true';
    }

    /*
     * Set the logged out value in session storage, used to achieve multi tab logout
     */
    public static set loggedOut(value: boolean) {

        const key = HtmlStorageHelper._loggedOutState;
        localStorage.setItem(key, String(value));
    }

    /*
     * This determines if a local storage update to logged out occurred on another browser tab
     */
    public static isLoggedOutEvent(event: StorageEvent): boolean {

        if (event.storageArea === localStorage) {

            const key = HtmlStorageHelper._apiSessionKeyName;
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
