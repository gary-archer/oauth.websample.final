/*
 * A utility class to keep HTML storage organised
 */
export class HtmlStorageHelper {

    private static _loginCurrentApp = 'login.currentapp';
    private static _loggedOutState = 'loggedout.state';
    private static _antiForgeryToken = 'csrf.token';
    private static _apiSessionKeyName = 'session.id';

    /*
     * When processing the login response, return to the current app
     */
    public static postLoginRestore(): string {

        const appBasePath = sessionStorage.getItem(HtmlStorageHelper._loginCurrentApp) || '';
        sessionStorage.removeItem(HtmlStorageHelper._loginCurrentApp);
        return appBasePath;
    }

    /*
     * Set the logged out value in session storage, used to achieve multi tab logout
     */
    public static set loggedOut(value: boolean) {

        localStorage.setItem(HtmlStorageHelper._loggedOutState, String(value));
    }

    /*
     * Set the antiforgery token after processing a login response
     * This is only a CSRF secondary protection and not a full credential
     * So it is safe to store it in local storage, where a different site cannot access it
     */
    public static set antiForgeryToken(token: string) {

        localStorage.setItem(HtmlStorageHelper._antiForgeryToken, token);
    }

    /*
     * Get the antiforgery token used as a secondary CSRF defense in depth
     */
    public static get antiForgeryToken(): string {

        return localStorage.getItem(HtmlStorageHelper._antiForgeryToken) || '';
    }

    /*
     * Clear the antiforgery token when logging out
     */
    public static clearAntiForgeryToken(): void {

        localStorage.removeItem(HtmlStorageHelper._antiForgeryToken);
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
