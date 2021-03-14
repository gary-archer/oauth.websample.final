"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieService = void 0;
const cookie_encrypter_1 = require("cookie-encrypter");
const errorHandler_1 = require("../errors/errorHandler");
/*
 * Our cookie service class will deal with cookie handling during requests to the token endpoint
 */
class CookieService {
    constructor(rootDomain, base64encryptionKey) {
        this._authCookieName = 'mycompany-auth';
        this._csrfCookieName = 'mycompany-csrf';
        this._rootDomain = rootDomain;
        this._encryptionKey = Buffer.from(base64encryptionKey, 'base64');
    }
    /*
     * Write a same domain response cookie containing the refresh token
     */
    writeAuthCookie(clientId, refreshToken, response) {
        const encryptedData = cookie_encrypter_1.encryptCookie(refreshToken, { key: this._encryptionKey });
        response.cookie(`${this._authCookieName}-${clientId}`, encryptedData, this._getCookieOptions());
    }
    /*
     * Read the refresh token from the request cookie
     */
    readAuthCookie(clientId, request) {
        const cookieName = `${this._authCookieName}-${clientId}`;
        if (request.cookies) {
            const encryptedData = request.cookies[`${this._authCookieName}-${clientId}`];
            if (encryptedData) {
                return this._decryptCookie(cookieName, encryptedData);
            }
        }
        throw errorHandler_1.ErrorHandler.fromMissingCookieError('No auth cookie was found in the incoming request');
    }
    /*
     * Write a CSRF cookie to make it harder for malicious code to post bogus forms to our token refresh endpoint
     */
    writeCsrfCookie(clientId, response, value) {
        const encryptedData = cookie_encrypter_1.encryptCookie(value, { key: this._encryptionKey });
        response.cookie(`${this._csrfCookieName}-${clientId}`, encryptedData, this._getCookieOptions());
    }
    /*
     * Write a response cookie containing a CSRF value, which we will verify during refresh token requests
     */
    readCsrfCookie(clientId, request) {
        const cookieName = `${this._csrfCookieName}-${clientId}`;
        if (request.cookies) {
            const encryptedData = request.cookies[`${this._csrfCookieName}-${clientId}`];
            if (encryptedData) {
                return this._decryptCookie(cookieName, encryptedData);
            }
        }
        throw errorHandler_1.ErrorHandler.fromMissingCookieError('No CSRF cookie was found in the incoming request');
    }
    /*
     * Corrupt the refresh token inside the cookie by adding extra bytes to it
     * This will cause an invalid_grant error when the refresh token is next sent to the Authorization Server
     */
    expire(clientId, refreshToken, request, response) {
        const expiredRefreshToken = `x${refreshToken}x`;
        this.writeAuthCookie(clientId, expiredRefreshToken, response);
    }
    /*
     * Clear all cookies when the user session expires
     */
    clearAll(clientId, response) {
        response.clearCookie(`${this._authCookieName}-${clientId}`, this._getCookieOptions());
        response.clearCookie(`${this._csrfCookieName}-${clientId}`, this._getCookieOptions());
    }
    /*
     * Both our auth cookie and CSRF cookie use the same options
     */
    _getCookieOptions() {
        return {
            // The cookie cannot be read by Javascript code
            httpOnly: true,
            // The cookie can only be sent over an HTTPS connection
            secure: true,
            // The cookie written by this app will be sent to other web applications
            domain: `.${this._rootDomain}`,
            // The cookie is only used for OAuth token renewal requests, and not for Web / API requests
            path: '/reverse-proxy',
            // Other domains cannot send the cookie, which reduces cross site scripting risks
            sameSite: 'strict',
        };
    }
    /*
     * A helper method to decrypt a cookie and report errors clearly
     */
    _decryptCookie(cookieName, encryptedData) {
        try {
            return cookie_encrypter_1.decryptCookie(encryptedData, { key: this._encryptionKey });
        }
        catch (e) {
            throw errorHandler_1.ErrorHandler.fromCookieDecryptionError(cookieName, e);
        }
    }
}
exports.CookieService = CookieService;
