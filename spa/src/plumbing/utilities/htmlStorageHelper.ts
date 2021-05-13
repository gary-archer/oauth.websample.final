/*
 * A utility class to keep our HTML storage organised
 */
export class HtmlStorageHelper {

    private static _prefix = 'finalspa.'
    private static _antiForgeryToken = 'aft';
    private static _apiSessionKeyName = 'apisessionid';

    /*
     * Return a CSRF field used for refresh token grant requests to the reverse proxy token endpoint
     */
    public static get antiForgeryToken(): string {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._antiForgeryToken}`;
        return localStorage.getItem(key) || '';
    }

    /*
     * Set the CSRF field used with the refresh token cookie
     */
    public static set antiForgeryToken(value: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._antiForgeryToken}`;
        localStorage.setItem(key, value);
    }

    /*
     * Remove the CSRF field
     */
    public static removeAntiForgeryToken(): void {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._antiForgeryToken}`;
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
     * Record a session id to be sent to the API for requests from this browser tab
     */
    public static set apiSessionId(value: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._apiSessionKeyName}`;
        sessionStorage.setItem(key, value);
    }
}
