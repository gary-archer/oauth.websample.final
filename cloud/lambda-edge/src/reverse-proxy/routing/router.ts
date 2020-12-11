import {Configuration} from '../configuration/configuration';
import {LambdaEdgeRequest} from '../edge/lambdaEdgeRequest';
import {LambdaEdgeResponse} from '../edge/lambdaEdgeResponse';
import {ErrorHandler} from '../errors/errorHandler';
import {AuthService} from '../services/authService';
import {MockProxyServiceImpl} from '../services/mockProxyServiceImpl';
import {ProxyService} from '../services/proxyService'
import {ProxyServiceImpl} from '../services/proxyServiceImpl';

/*
 * A simple router class
 */
export class Router {

    private readonly _authService: AuthService;

    public constructor(configuration: Configuration) {

        const proxyService = this._createProxyService(configuration);
        this._authService = new AuthService(configuration, proxyService);
    }

    /*
     * Route the incoming request to the Auth Service operation and update the response
     */
    public async route(request: LambdaEdgeRequest, response: LambdaEdgeResponse): Promise<void> {

        const body = request.body;
        if (request.uri === '/reverse-proxy/token') {
            if (request.method === 'post') {

                if (body.grant_type === 'authorization_code') {

                    // Process the authorization result, then return tokens and write the refresh token cookie
                    await this._authService.authorizationCodeGrant(request, response);
                    return;

                } else if (body.grant_type === 'refresh_token') {

                    // Process the auth cookie, send a refresh token grant message and return a new access token
                    await this._authService.refreshTokenGrant(request, response);
                    return;
                }

            } else if (request.method === 'delete') {

                // Clear the auth cookie when requested
                await this._authService.clearCookies(request, response);
                return;

            }
        } else if (request.uri === '/reverse-proxy/expire') {

            // Rewrite the refresh token in the auth cookie, to make it act expired
            await this._authService.expireRefreshToken(request, response);
            return;
        }

        // Handle invalid routes
        throw ErrorHandler.fromRequestNotFound();
    }

    /*
     * Create the service that forwards to the Authorization Server and support mocking
     */
    private _createProxyService(configuration: Configuration): ProxyService {

        if (configuration.useMockResponses) {
            return new MockProxyServiceImpl();
        } else {
            return new ProxyServiceImpl(configuration);
        }

    }
}