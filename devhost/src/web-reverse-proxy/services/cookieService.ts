import {encryptCookie, decryptCookie} from 'cookie-encrypter'
import {CookieOptions, Request, Response} from 'express';
import {ClientError} from '../errors/clientError';

/*
 * Our cookie service class will deal with cookie handling during requests to the token endpoint
 */
export class CookieService {

    private readonly _authCookieName = 'mycompany-auth';
    private readonly _csrfCookieName = 'mycompany-csrf';
    private readonly _encryptionKey: Buffer;

    public constructor(base64encryptionKey: string) {
        this._encryptionKey = Buffer.from(base64encryptionKey, 'base64');
    }

    /*
     * Write a same domain response cookie containing the refresh token
     */
    public writeAuthCookie(clientId: string, refreshToken: string, response: Response): void {

        // Encrypt the cookie, since it contains a refresh token
        const encryptedData = encryptCookie(refreshToken, {key: this._encryptionKey});
        response.cookie(`${this._authCookieName}-${clientId}`, encryptedData, this._getCookieOptions());
    }

    /*
     * Read the refresh token from the request cookie
     */
    public readAuthCookie(clientId: string, request: Request): string {

        if (request.cookies) {
            const encryptedData = request.cookies[`${this._authCookieName}-${clientId}`];
            if (encryptedData) {
                return decryptCookie(encryptedData, {key: this._encryptionKey});
            }
        }

        throw ClientError.invalidGrant('No valid auth cookie was found in the incoming request');
    }

    /*
     * Write a CSRF cookie to make it harder for malicious code to post bogus forms to our token refresh endpoint
     */
    public writeCsrfCookie(clientId: string, response: Response, value: string): void {

        const options = {
            httpOnly: true,
            secure: true,
            path: '/reverse-proxy',
            sameSite: 'strict',
        };

        // Encrypt the cookie, since it contains a refresh token
        response.cookie(`${this._csrfCookieName}-${clientId}`, value, this._getCookieOptions());
    }

    /*
     * Write a response cookie containing a CSRF value, which we will verify during refresh token requests
     */
    public readCsrfCookie(clientId: string, request: Request): string {

        if (request.cookies) {
            const value = request.cookies[`${this._csrfCookieName}-${clientId}`];
            if (value) {
                return value;
            }
        }

        throw ClientError.invalidGrant('No valid CSRF cookie was found in the incoming request');
    }

    /*
     * Corrupt the refresh token inside the cookie by adding extra bytes to it
     * This will cause an invalid_grant error when the refresh token is next sent to the Authorization Server
     */
    public expire(clientId: string, refreshToken: string, request: Request, response: Response): void {

        const expiredRefreshToken = `x${refreshToken}x`;
        this.writeAuthCookie(clientId, expiredRefreshToken, response);
    }

    /*
     * Clear all cookies when the user session expires
     */
    public clearAll(clientId: string, response: Response): void {

        response.clearCookie(`${this._authCookieName}-${clientId}`, this._getCookieOptions());
        response.clearCookie(`${this._csrfCookieName}-${clientId}`, this._getCookieOptions());
    }

    /*
     * Both our auth cookie and CSRF cookie use the same options
     */
    private _getCookieOptions(): CookieOptions {

        return {

            // The cookie cannot be read by Javascript code, but any logged in user can get the cookie via HTTP tools
            httpOnly: true,

            // The cookie can only be sent over an HTTPS connection
            secure: true,

            // The cookie is only used for OAuth token endpoint requests, and not for Web / API requests
            path: '/reverse-proxy',

            // The cookie's intended usage is same domain only
            // Newer browsers will honour this by not sending it from other web domains
            sameSite: 'strict',
        };
    }
}
