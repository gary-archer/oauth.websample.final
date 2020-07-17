import {randomBytes} from 'crypto';
import {Request, Response} from 'express';
import {Configuration} from '../configuration/configuration';
import {ApiLogger} from '../utilities/apiLogger';
import {CookieService} from './cookieService';
import {ProxyService} from './proxyService';
import {ClientError} from '../errors/clientError';

/*
 * The entry point for token endpoint related operations
 */
export class AuthService {

    private readonly _configuration: Configuration
    private readonly _proxyService: ProxyService;
    private readonly _cookieService: CookieService;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
        this._proxyService = new ProxyService(configuration.tokenEndpoint);
        this._cookieService = new CookieService(configuration.cookieEncryptionKey);
    }

    /*
     * Process an authorization code grant message
     */
    public async authorizationCodeGrant(request: Request, response: Response): Promise<void> {

        // Proxy the request to the authorization server
        const clientId = this._validateAndGetClientId(request, false);
        ApiLogger.info(`Proxying Authorization Code Grant for client ${clientId}`);
        const authCodeGrantData = await this._proxyService.sendAuthorizationCodeGrant(request, response);

        // Get the refresh token
        const refreshToken = authCodeGrantData.refresh_token;
        if (refreshToken) {

            // If it exists, remove it from the response to the SPA and write it to a cookie
            delete authCodeGrantData.refresh_token;
            this._cookieService.writeAuthCookie(clientId, refreshToken, response);

            // Also write a CSRF cookie and return it in the response
            const randomValue = randomBytes(32).toString('base64');
            this._cookieService.writeCsrfCookie(clientId, response, randomValue);
            authCodeGrantData.csrf_token = randomValue;
        }

        // Send access and id tokens to the SPA
        response.send(JSON.stringify(authCodeGrantData));
    }

    /*
     * Process a refresh token grant message
     */
    public async refreshTokenGrant(request: Request, response: Response): Promise<void> {

        // Get the refresh token from the auth cookie
        const clientId = this._validateAndGetClientId(request, true);
        ApiLogger.info(`Proxying Refresh Token Grant for client ${clientId}`);
        const refreshToken = this._cookieService.readAuthCookie(clientId, request);

        // Send it to the Authorization Server
        const refreshTokenGrantData =
            await this._proxyService.sendRefreshTokenGrant(refreshToken, request, response);

        // Handle updated refresh tokens
        const rollingRefreshToken = refreshTokenGrantData.refresh_token;
        if (rollingRefreshToken) {

            // If a new refresh token has been issued, remove it from the response to the SPA and update the cookie
            delete refreshTokenGrantData.refresh_token;
            this._cookieService.writeAuthCookie(clientId, rollingRefreshToken, response);
        }

        // Send access and id tokens to the SPA
        response.send(JSON.stringify(refreshTokenGrantData));
    }

    /*
     * Make the refresh token act expired
     */
    public async expireRefreshToken(request: Request, response: Response): Promise<void> {

        const clientId = this._validateAndGetClientId(request, true);
        ApiLogger.info(`Expiring Refresh Token for client ${clientId}`);

        // Get the current refresh token
        const refreshToken = this._cookieService.readAuthCookie(clientId, request);

        // Write a corrupted refresh token to the cookie, which will fail on the next token renewal attempt
        this._cookieService.expire(clientId, refreshToken, request, response);
        response.status(204).send();
    }

    /*
     * Do some initial verification and then return the client id from the request body
     */
    private _validateAndGetClientId(request: Request, requireCsrfCookie: boolean): string {

        // Check the HTTP request has the expected web origin
        this._validateOrigin(request);

        // Get the client id from the request body
        const clientId = this._getClientId(request);

        // For token refresh requests, also check that the HTTP request has an extra header
        if (requireCsrfCookie) {
            this._validateCsrfCookie(clientId, request);
        }

        return clientId;
    }

    /*
     * This check helps to ensure that our cookie is sent from a browser at the web origin and not from tools
     */
    private _validateOrigin(request: Request): void {

        if (!request.headers || !request.headers.origin) {
            throw ClientError.invalidGrant('The request did not include the web origin header');
        }

        const found = this._configuration.trustedWebOrigins.find((o) => o === request.headers.origin);
        if (!found) {
            throw ClientError.invalidGrant(`The origin header had an untrusted value of ${request.headers.origin}`);
        }
    }

    /*
     * All requests include a client id in the request body
     */
    private _getClientId(request: Request): string {

        if (request.body) {
            if (request.body.client_id) {
                return request.body.client_id;
            }
        }

        throw ClientError.invalidGrant('No client_id was found in the received form url encoded data');
    }

    /*
     * Extra mitigation in the event of malicious code trying to POST a refresh token grant request
     * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
     */
    private _validateCsrfCookie(clientId: string, request: Request) {

        // Check for a CSRF value in the request
        const cookieName = this._cookieService.getCsrfCookieName(clientId);
        if (!request.body || !request.body[cookieName]) {
            throw ClientError.invalidGrant('No value CSRF field was found in the request body');
        }

        // Next check for a matching cookie
        const cookieValue = this._cookieService.readCsrfCookie(clientId, request);
        if (request.headers[cookieName] !== cookieValue) {
            throw ClientError.invalidGrant('The CSRF cookie request does not match the CSRF cookie value');
        }
    }
}
