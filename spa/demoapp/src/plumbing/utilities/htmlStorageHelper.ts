import {BasePath} from './basePath';

/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _loginCurrentApp = 'login.currentapp';
    private static _loginCurrentPath = 'login.currentpath';
    private static _loggedOutState = 'loggedout.state';
    private static _antiForgeryToken = 'csrf.token';
    private static _apiSessionKeyName = 'session.id';

    /*
     * Before login, store the current app and its path
     */
    public static preLoginStore(currentPath: string): void {

        sessionStorage.setItem(HtmlStorageHelper._loginCurrentApp, BasePath.get());
        sessionStorage.setItem(HtmlStorageHelper._loginCurrentPath, currentPath);
    }

    /*
     * After login, return the stored path to navigate back to
     */
    public static postLoginRestore(): string | null {

        const path = sessionStorage.getItem(HtmlStorageHelper._loginCurrentPath);
        sessionStorage.removeItem(HtmlStorageHelper._loginCurrentPath);
        return path;
    }

    /*
     * Get the logged out value from local storage, which is shared across all browser tabs
     */
    public static get loggedOut(): boolean {

        return localStorage.getItem(HtmlStorageHelper._loggedOutState) === 'true';
    }

    /*
     * Get the antiforgery token used as a secondary CSRF defense in depth
     */
    public static get antiForgeryToken(): string {

        return localStorage.getItem(HtmlStorageHelper._antiForgeryToken) || '';
    }

    /*
     * This determines if a local storage update to logged out occurred on another browser tab
     */
    public static isLoggedOutEvent(event: StorageEvent): boolean {

        if (event.storageArea === localStorage) {
            return event.key === HtmlStorageHelper._loggedOutState && event.newValue === 'true';
        }

        return false;
    }

    /*
     * Get the session id for API requests from this browser tab
     */
    public static get apiSessionId(): string {

        return sessionStorage.getItem(HtmlStorageHelper._apiSessionKeyName) || '';
    }

    /*
     * Record a session id to be sent to the API for requests from this browser tab
     */
    public static set apiSessionId(value: string) {

        sessionStorage.setItem(HtmlStorageHelper._apiSessionKeyName, value);
    }
}
