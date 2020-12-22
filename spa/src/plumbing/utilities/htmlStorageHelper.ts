/*
 * A utility class to keep our HTML storage organised
 */
export class HtmlStorageHelper {

    private static _prefix = 'finalspa.'
    private static _cookieCsrfField = 'cookie-csrf-field';
    private static _identityProvider = 'identity-provider';
    private static _apiSessionKeyName = 'api-sessionid';
    private static _oidcLogLevelKeyName = 'oidc-log-level';

    // Used to deal with refresh tokens stored in cookies
    public static get tokenEndpointCookieCsrfField(): string {
        return localStorage.getItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`) ?? '';
    }

    public static set tokenEndpointCookieCsrfField(value: string) {
        localStorage.setItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`, value);
    }

    public static removeTokenEndpointCookieCsrfField(): void {
        localStorage.removeItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._cookieCsrfField}`);
    }

    // Used to select an identity provider via an idp query parameter
    public static get identityProvider(): string {
        return localStorage.getItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._identityProvider}`) ?? '';
    }

    public static set identityProvider(value: string) {
        localStorage.setItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._identityProvider}`, value);
    }

    public static removeIdentityProvider(): void {
        localStorage.removeItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._identityProvider}`);
    }

    // Used to supply a unique session id to the API for the current browser tab
    public static get apiSessionId(): string {
        return sessionStorage.getItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._apiSessionKeyName}`) ?? '';
    }

    public static set apiSessionId(value: string) {
        sessionStorage.setItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._apiSessionKeyName}`, value);
    }

    // Used to capture logs from the OIDC Client library for the current browser tab
    public static get oidcLogLevel(): string {
        return sessionStorage.getItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`) ?? '';
    }

    public static set oidcLogLevel(value: string) {
        sessionStorage.setItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`, value);
    }
}
