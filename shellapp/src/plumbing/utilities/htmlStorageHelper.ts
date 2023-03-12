/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _loginAppBasePath = 'login.appbasepath';
    private static _loggedOutState = 'loggedout.state';
    private static _apiSessionKeyName = 'session.id';

    /*
     * Get the path of the micro UI that began the login redirect
     */
    public static get loginAppBasePath(): any {

        const key = HtmlStorageHelper._loginAppBasePath;
        return sessionStorage.getItem(key);
    }

    /*
     * Clean up the login app path
     */
    public static removeLoginAppBasePath(): void {

        const key = HtmlStorageHelper._loginAppBasePath;
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
