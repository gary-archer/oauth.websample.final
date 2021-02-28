/*
 * A utility class to keep our HTML storage organised
 */
export class HtmlStorageHelper {

    private static _prefix = 'finalspa.'
    private static _isLoggedInField = 'loggedin';
    private static _cookieCsrfField = 'cookie-csrf-field';
    private static _identityProvider = 'identity-provider';
    private static _apiSessionKeyName = 'api-sessionid';
    private static _oidcLogLevelKeyName = 'oidc-log-level';

    /*
     * Return a CSRF field used for refresh token grant requests to the reverse proxy token endpoint
     */
    public static get tokenEndpointCookieCsrfField(): string {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`;
        return localStorage.getItem(key) || '';
    }

    /*
     * Set the CSRF field used with the refresh token cookie
     */
    public static set tokenEndpointCookieCsrfField(value: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`;
        localStorage.setItem(key, value);
    }

    /*
     * Remove the CSRF field
     */
    public static removeTokenEndpointCookieCsrfField(): void {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`;
        localStorage.removeItem(key);
    }

    /*
     * Return the preferred identity provider for the user
     */
    public static get identityProvider(): string {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._identityProvider}`;
        return localStorage.getItem(key) || '';
    }

    /*
     * Record a federated login value supplied in a query parameter such as idp
     */
    public static set identityProvider(value: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._identityProvider}`;
        localStorage.setItem(key, value);
    }

    /*
     * Remove a federated login value
     */
    public static removeIdentityProvider(): void {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._identityProvider}`;
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

    /*
     * Get the log level for viewing OIDC client library details
     */
    public static get oidcLogLevel(): string {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`;
        return localStorage.getItem(key) || '';
    }

    /*
     * Record the log level for viewing OIDC client library details
     */
    public static set oidcLogLevel(value: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`;
        localStorage.setItem(key, value);
    }
}
