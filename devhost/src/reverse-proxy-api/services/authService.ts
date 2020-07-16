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

    private readonly _proxyService: ProxyService;
    private readonly _cookieService: CookieService;

    public constructor(configuration: Configuration) {
        this._proxyService = new ProxyService(configuration.oauth.tokenEndpoint);
        this._cookieService = new CookieService(configuration.oauth.cookieEncryptionKey);
    }

    /*
     * Process an authorization code grant message
     */
    public async authorizationCodeGrant(request: Request, response: Response): Promise<void> {

        // Proxy the request to the authorization server
        const clientId = this._getClientId(request);
        ApiLogger.info(`Proxying Authorization Code Grant for client ${clientId}`);
        const authCodeGrantData = await this._proxyService.sendAuthorizationCodeGrant(request, response);

        // Get the refresh token
        const refreshToken = authCodeGrantData.refresh_token;
        if (refreshToken) {

            // If it exists, remove it from the response to the SPA and write it to a cookie
            delete authCodeGrantData.refresh_token;
            this._cookieService.write(clientId, refreshToken, response);
        }

        // Send access and id tokens to the SPA
        response.send(JSON.stringify(authCodeGrantData));
    }

    /*
     * Process a refresh token grant message
     */
    public async refreshTokenGrant(request: Request, response: Response): Promise<void> {

        // Get the refresh token from the auth cookie
        const clientId = this._getClientId(request);
        ApiLogger.info(`Proxying Refresh Token Grant for client ${clientId}`);
        const refreshToken = this._cookieService.read(clientId, request);

        // Send it to the Authorization Server
        const refreshTokenGrantData =
            await this._proxyService.sendRefreshTokenGrant(refreshToken, request, response);

        // Handle updated refresh tokens
        const rollingRefreshToken = refreshTokenGrantData.refresh_token;
        if (rollingRefreshToken) {

            // If a new refresh token has been issued, remove it from the response to the SPA and update the cookie
            delete refreshTokenGrantData.refresh_token;
            this._cookieService.write(clientId, rollingRefreshToken, response);
        }

        // Send access and id tokens to the SPA
        response.send(JSON.stringify(refreshTokenGrantData));
    }

    /*
     * Make the refresh token act expired
     */
    public async expireRefreshToken(request: Request, response: Response): Promise<void> {

        const clientId = this._getClientId(request);
        ApiLogger.info(`Expiring Refresh Token for client ${clientId}`);

        // Get the current refresh token
        const refreshToken = this._cookieService.read(clientId, request);

        // Write a corrupted refresh token to the cookie, which will fail on the next token renewal attempt
        this._cookieService.expire(clientId, refreshToken, request, response);
        response.status(204).send();
    }

    /*
     * Do some initial verification that we have a request body and client id
     */
    private _getClientId(request: Request): string {

        if (request.body) {
            if (request.body.client_id) {
                return request.body.client_id;
            }
        }

        throw ClientError.invalidGrant('No client_id was found in the received form url encoded data');
    }
}
