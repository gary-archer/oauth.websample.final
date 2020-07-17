import {encryptCookie, decryptCookie} from 'cookie-encrypter'
import {randomBytes} from 'crypto';
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

        // The auth cookie is HTTP only, requires SSL and browsers can only send it from our web origin
        const options = {
            httpOnly: true,
            secure: true,
            path: '/reverse-proxy',
            sameSite: 'strict',
        };

        // Encrypt the cookie, since it contains a refresh token
        const encryptedData = encryptCookie(refreshToken, {key: this._encryptionKey});
        response.cookie(`${this._authCookieName}-${clientId}`, encryptedData, options as CookieOptions);
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
     * Write a CSRF cookie to make it harder for malicious code to successfully post to the token refresh endpoint
     */
    public writeCsrfCookie(clientId: string, response: Response, value: string): void {

        const options = {
            httpOnly: true,
            secure: true,
            path: '/reverse-proxy',
            sameSite: 'strict',
        };

        // Encrypt the cookie, since it contains a refresh token
        response.cookie(`${this._csrfCookieName}-${clientId}`, value, options as CookieOptions);
    }

    /*
     * Write a response cookie that the client must also send in a request field on subsequent requests
     */
    public readCsrfCookie(clientId: string, request: Request): string {

        if (request.cookies) {
            const encryptedData = request.cookies[`${this._csrfCookieName}-${clientId}`];
            if (encryptedData) {
                return decryptCookie(encryptedData, {key: this._encryptionKey});
            }
        }

        throw ClientError.invalidGrant('No valid CSRF cookie was found in the incoming request');
    }

    /*
     * Return a name to check against a header
     */
    public getCsrfCookieName(clientId: string): string {
        return `${this._csrfCookieName}-${clientId}`;
    }

    /*
     * Corrupt the refresh token inside the cookie by adding extra bytes to it
     * This will cause an invalid_grant error when the refresh token is next sent to the Authorization Server
     */
    public expire(clientId: string, refreshToken: string, request: Request, response: Response): void {

        const expiredRefreshToken = `x${refreshToken}x`;
        this.writeAuthCookie(clientId, expiredRefreshToken, response);
    }
}
