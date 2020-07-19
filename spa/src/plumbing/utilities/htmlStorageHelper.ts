/*
 * A utility class to keep our HTML storage organised
 */
export class HtmlStorageHelper {

    private static _prefix = 'finalspa.'
    private static _apiSessionKeyName = 'api-sessionid';
    private static _oidcLogLevelKeyName = 'oidc-log-level';
    private static _cookieCsrfField = 'cookie-csrf-field';

    public static get apiSessionId(): string {
        return sessionStorage.getItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._apiSessionKeyName}`) ?? '';
    }

    public static set apiSessionId(value: string) {
        sessionStorage.setItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._apiSessionKeyName}`, value);
    }

    public static get oidcLogLevel(): string {
        return sessionStorage.getItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`) ?? '';
    }

    public static set oidcLogLevel(value: string) {
        sessionStorage.setItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`, value);
    }

    public static get tokenEndpointCookieCsrfField(): string {
        return localStorage.getItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`) ?? '';
    }

    public static set tokenEndpointCookieCsrfField(value: string) {
        localStorage.setItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`, value);
    }

    /*
     * Clear any items we want to store when the user session expires
     */
    public static removeTokenEndpointCookieCsrfField() {
        localStorage.removeItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`);
    }
}
