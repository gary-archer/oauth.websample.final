import {randomBytes} from 'crypto';
import {Request, Response} from 'express';
import {WebReverseProxyConfiguration} from '../../configuration/webReverseProxyConfiguration';
import {ApiLogger} from '../utilities/apiLogger';
import {CookieService} from './cookieService';
import {ProxyService} from './proxyService';
import {ErrorHandler} from '../errors/errorHandler';

/*
 * The entry point for token endpoint related operations
 */
export class AuthService {

    // Worker classes
    private readonly _configuration: WebReverseProxyConfiguration;
    private readonly _proxyService: ProxyService;
    private readonly _cookieService: CookieService;

    // CSRF constants
    private readonly _responseBodyFieldName = 'csrf_field';
    private readonly _requestHeaderFieldName = 'x-mycompany-finalspa-refresh-csrf';

    public constructor(configuration: WebReverseProxyConfiguration) {
        this._configuration = configuration;
        this._proxyService = new ProxyService(configuration.tokenEndpoint);
        this._cookieService = new CookieService(configuration.cookieRootDomain, configuration.cookieEncryptionKey);
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

            // Write the refresh token to an HTTP only cookie
            delete authCodeGrantData.refresh_token;
            this._cookieService.writeAuthCookie(clientId, refreshToken, response);

            // Write a CSRF HTTP only cookie and also give the UI the value in a response field
            const randomValue = randomBytes(32).toString('base64');
            this._cookieService.writeCsrfCookie(clientId, response, randomValue);
            authCodeGrantData[this._responseBodyFieldName] = randomValue;
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
     * An operation to clear cookies when the user session ends
     */
    public async clearCookies(request: Request, response: Response): Promise<void> {

        // Validate and get client details
        const clientId = this._validateAndGetClientId(request, true);
        ApiLogger.info(`Clearing Cookies for client ${clientId}`);

        // Clear all cookies for this client
        this._cookieService.clearAll(clientId, response);
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
     * If there is an origin header it must be our web domain
     */
    private _validateOrigin(request: Request): void {

        if (request.headers && request.headers.origin) {
            if (request.headers.origin.toLowerCase() !== this._configuration.trustedWebOrigin.toLowerCase()) {
                throw ErrorHandler.fromSecurityVerificationError(`The origin header had an untrusted value of ${request.headers.origin}`);
            }
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

        throw ErrorHandler.fromSecurityVerificationError('No client_id was found in the received form url encoded data');
    }

    /*
     * Extra mitigation in the event of malicious code trying to POST a refresh token grant request via a scripted form
     * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
     */
    private _validateCsrfCookie(clientId: string, request: Request) {

        // Get the CSRF cookie
        const cookieValue = this._cookieService.readCsrfCookie(clientId, request);

        // Check there is a matching CSRF request field
        if (!request.headers || !request.headers[this._requestHeaderFieldName]) {
            throw ErrorHandler.fromSecurityVerificationError('No CSRF request header field was supplied');
        }

        // Check that the values match
        if (cookieValue !== request.headers[this._requestHeaderFieldName]) {
            throw ErrorHandler.fromSecurityVerificationError('The CSRF request header does not match the CSRF cookie value');
        }
    }
}
