/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _loginPrefix = 'login.';
    private static _appPrefix = 'demoapp.';
    private static _appState = 'appState';
    private static _apiSessionKeyName = 'apisessionid';
    private static _loggedOutKeyName = 'loggedout';

    /*
     * Get any stored app state when handling login responses
     */
    public static get appState(): any {

        const key = `${HtmlStorageHelper._loginPrefix}.${HtmlStorageHelper._appState}`;
        const data = sessionStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }

        return null;
    }

    /*
     * Set app state before triggering a login redirect
     */
    public static set appState(data: any) {

        const key = `${HtmlStorageHelper._loginPrefix}${HtmlStorageHelper._appState}`;
        sessionStorage.setItem(key, JSON.stringify(data));
    }

    /*
     * Clean up app state
     */
    public static removeAppState(): void {

        const key = `${HtmlStorageHelper._appPrefix}${HtmlStorageHelper._appState}`;
        sessionStorage.removeItem(key);
    }

    /*
     * Get the session id for API requests from this browser tab
     */
    public static get apiSessionId(): string {

        const key = `${HtmlStorageHelper._appPrefix}${HtmlStorageHelper._apiSessionKeyName}`;
        return sessionStorage.getItem(key) || '';
    }

    /*
     * Record a session id to be sent to the API for requests from this browser tab
     */
    public static set apiSessionId(value: string) {

        const key = `${HtmlStorageHelper._appPrefix}${HtmlStorageHelper._apiSessionKeyName}`;
        sessionStorage.setItem(key, value);
    }

    /*
     * Get the logged out value from session storage
     */
    public static get loggedOut(): boolean {

        const key = `${HtmlStorageHelper._appPrefix}${HtmlStorageHelper._loggedOutKeyName}`;
        return localStorage.getItem(key) === 'true';
    }

    /*
     * Set the logged out value in session storage, used to achieve multi tab logout
     */
    public static set loggedOut(value: boolean) {

        const key = `${HtmlStorageHelper._appPrefix}${HtmlStorageHelper._loggedOutKeyName}`;
        localStorage.setItem(key, String(value));
    }

    /*
     * This determines if a local storage update to logged out occurred on another browser tab
     */
    public static isLoggedOutEvent(event: StorageEvent): boolean {

        if (event.storageArea === localStorage) {

            const key = `${HtmlStorageHelper._appPrefix}${HtmlStorageHelper._loggedOutKeyName}`;
            return event.key === key && event.newValue === 'true';
        }

        return false;
    }
}
