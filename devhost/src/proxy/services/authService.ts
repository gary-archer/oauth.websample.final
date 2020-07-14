import {Request, Response} from 'express';
import {Configuration} from '../configuration/configuration';
import {ApiLogger} from '../utilities/apiLogger';
import {CookieService} from './cookieService';
import {ProxyService} from './proxyService';

/*
 * The entry point for token endpoint related operations
 */
export class AuthService {

    private readonly _proxyService: ProxyService;
    private readonly _cookieService: CookieService;

    public constructor(configuration: Configuration) {
        this._proxyService = new ProxyService(configuration.oauth);
        this._cookieService = new CookieService();
    }

    /*
     * Process an authorization code grant message
     */
    public async authorizationCodeGrant(request: Request, response: Response): Promise<void> {

        // Proxy the request to the authorization server
        ApiLogger.info('Proxying Authorization Code Grant');
        const authCodeGrantData = await this._proxyService.sendAuthorizationCodeGrant(request, response);

        // Get the refresh token
        const refreshToken = authCodeGrantData.refresh_token;
        if (refreshToken) {

            // If it exists, remove it from the response to the SPA
            delete authCodeGrantData.refresh_token;

            // Write it to a cookie
            this._cookieService.write(refreshToken, response);
        }

        // Send access and id tokens to the SPA
        response.send(JSON.stringify(authCodeGrantData));
    }

    /*
     * Process a refresh token grant message
     */
    public async refreshTokenGrant(request: Request, response: Response): Promise<void> {

        // Get the refresh token from the auth cookie
        ApiLogger.info('Proxying Refresh Token Grant');
        let refreshToken = this._cookieService.read(request);
        
        // Send it to the Authorization Server
        const refreshTokenGrantData =
            await this._proxyService.sendRefreshTokenGrant(refreshToken, request, response);

        // Handle updated refresh tokens
        const rollingRefreshToken = refreshTokenGrantData.refresh_token;
        if (rollingRefreshToken) {

            // If a new refresh token has been issued, remove it from the response to the SPA
            refreshToken = rollingRefreshToken;
            delete refreshTokenGrantData.refresh_token;
        }

        // Update the cookie
        const cookie = new CookieService();
        cookie.write(refreshToken, response);

        // Send access and id tokens to the SPA
        response.send(JSON.stringify(refreshTokenGrantData));
    }
}
