import cookie, {CookieSerializeOptions} from 'cookie';
import {encryptCookie, decryptCookie} from 'cookie-encrypter';
import {LambdaEdgeRequest} from '../edge/lambdaEdgeRequest';
import {LambdaEdgeResponse} from '../edge/lambdaEdgeResponse';
import {ErrorHandler} from '../errors/errorHandler';

/*
 * Our cookie service class will deal with cookie handling during requests to the token endpoint
 */
export class CookieService {

    private readonly _authCookieName = 'mycompany-auth';
    private readonly _csrfCookieName = 'mycompany-csrf';
    private readonly _rootDomain: string;
    private readonly _encryptionKey: Buffer;

    public constructor(rootDomain: string, base64encryptionKey: string) {
        this._encryptionKey = Buffer.from(base64encryptionKey, 'base64');
        this._rootDomain = rootDomain;
    }

    /*
     * Write a same domain response cookie containing the refresh token
     */
    public writeAuthCookie(clientId: string, refreshToken: string, response: LambdaEdgeResponse): void {

        const encryptedData = encryptCookie(refreshToken, {key: this._encryptionKey});
        response.addHeader('set-cookie', this._formatCookie(`${this._authCookieName}-${clientId}`, encryptedData));
    }

    /*
     * Read the refresh token from the request cookie
     */
    public readAuthCookie(clientId: string, request: LambdaEdgeRequest): string {

        const cookieName = `${this._authCookieName}-${clientId}`;
        const encryptedData = request.getCookie(cookieName);
        if (encryptedData) {
            return this._decryptCookie(cookieName, encryptedData);
        }

        throw ErrorHandler.fromMissingCookieError('No auth cookie was found in the incoming request');
    }

    /*
     * Write a CSRF cookie to make it harder for malicious code to post bogus forms to our token refresh endpoint
     */
    public writeCsrfCookie(clientId: string, response: LambdaEdgeResponse, value: string): void {

        const encryptedData = encryptCookie(value, {key: this._encryptionKey});
        response.addHeader('set-cookie', this._formatCookie(`${this._csrfCookieName}-${clientId}`, encryptedData));
    }

    /*
     * Write a response cookie containing a CSRF value, which we will verify during refresh token requests
     */
    public readCsrfCookie(clientId: string, request: LambdaEdgeRequest): string {

        const cookieName = `${this._csrfCookieName}-${clientId}`;
        const encryptedData = request.getCookie(cookieName);
        if (encryptedData) {
            return this._decryptCookie(cookieName, encryptedData);
        }

        throw ErrorHandler.fromMissingCookieError('No CSRF cookie was found in the incoming request');
    }

    /*
     * Corrupt the refresh token inside the cookie by adding extra bytes to it
     * This will cause an invalid_grant error when the refresh token is next sent to the Authorization Server
     */
    public expire(
        clientId: string,
        refreshToken: string,
        request: LambdaEdgeRequest,
        response: LambdaEdgeResponse): void {

        const expiredRefreshToken = `x${refreshToken}x`;
        this.writeAuthCookie(clientId, expiredRefreshToken, response);
    }

    /*
     * Clear all cookies when the user session expires
     */
    public clearAll(clientId: string, response: LambdaEdgeResponse): void {

        response.addHeader('set-cookie', this._clearCookie(`${this._authCookieName}-${clientId}`));
        response.addHeader('set-cookie', this._clearCookie(`${this._csrfCookieName}-${clientId}`));
    }

    /*
     * Format a same site cookie for the web domain
     */
    private _formatCookie(name: string, value: string): string {

        return cookie.serialize(name, value, this._getCookieOptions());
    }

    /*
     * Clear the same site cookie
     */
    private _clearCookie(name: string): string {

        const options = this._getCookieOptions();
        options.expires = new Date(0);
        return cookie.serialize(name, '', options);
    }

    /*
     * A helper method to decrypt a cookie and report errors clearly
     */
    private _decryptCookie(cookieName: string, encryptedData: string) {

        try {
            return decryptCookie(encryptedData, {key: this._encryptionKey});

        } catch (e) {
            throw ErrorHandler.fromCookieDecryptionError(cookieName, e);
        }
    }

    /*
     * Both our auth cookie and CSRF cookie use the same options
     */
    private _getCookieOptions(): CookieSerializeOptions {

        return {

            // The cookie cannot be read by Javascript code, but any logged in user can get the cookie via HTTP tools
            httpOnly: true,

            // The cookie can only be sent over an HTTPS connection
            secure: true,

            // The cookie written by this app will be sent to other web applications
            domain: `.${this._rootDomain}`,

            // The cookie is only used for OAuth token endpoint requests, and not for Web / API requests
            path: '/reverse-proxy',

            // Other domains cannot send the cookie, which reduces cross site scripting risks
            sameSite: 'strict',
        };
    }
}
