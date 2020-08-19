import axios, {AxiosRequestConfig} from 'axios';
import {randomBytes} from 'crypto';
import {URLSearchParams} from 'url';
import {Configuration} from '../configuration/configuration';
import {LambdaEdgeRequest} from '../edge/lambdaEdgeRequest';
import {LambdaEdgeResponse} from '../edge/lambdaEdgeResponse';
import {ClientError} from '../errors/clientError';
import {ErrorHandler} from '../errors/errorHandler';
import {ProxyService} from './proxyService';

/*
 * The proxy service class will deal with routing requests to the Authorization Server
 */
export class ProxyServiceImpl implements ProxyService {

    private readonly _tokenEndpoint: string;

    public constructor(configuration: Configuration) {
        this._tokenEndpoint = configuration.tokenEndpoint;
    }

    /*
     * Forward the authorization code grant message to the Authorization Server
     */
    public async sendAuthorizationCodeGrant(request: LambdaEdgeRequest, response: LambdaEdgeResponse): Promise<any> {

        // Form the body of the authorization code grant message
        const formData = new URLSearchParams();
        for (const field in request.body) {
            if (field && request.body[field]) {
                formData.append(field, request.body[field]);
            }
        }

        // Send an HTTP message and get the response, then add a field for CSRF protection
        return this._postMessage(formData, response);
    }

    /*
     * Forward the refresh token grant message to the Authorization Server
     */
    public async sendRefreshTokenGrant(refreshToken: string, request: LambdaEdgeRequest, response: LambdaEdgeResponse): Promise<any>  {

        const formData = new URLSearchParams();
        for (const field in request.body) {
            if (field && request.body[field]) {
                formData.append(field, request.body[field]);
            }
        }

        if (formData.has('refresh_token')) {
            formData.delete('refresh_token');
        }

        formData.append('refresh_token', refreshToken);
        return this._postMessage(formData, response);
    }

    /*
     * Generate a field used for cross site request forgery protection
     */
    public generateCsrfField(): string {
        return randomBytes(32).toString('base64');
    }

    /*
     * Route a message to the Authorization Server
     */
    private async _postMessage(formData: URLSearchParams, response: LambdaEdgeResponse): Promise<void> {

        // Define request options
        const options = {
            url: this._tokenEndpoint,
            method: 'POST',
            data: formData,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'accept': 'application/json',
            },
        };

        try {

            // Call the Authorization Server
            const authServerResponse = await axios.request(options as AxiosRequestConfig);

            // Update the response for the success case and return data
            response.statusCode = authServerResponse.status;
            return authServerResponse.data;

        } catch (e) {

            // Handle OAuth error responses
            if (e.response && e.response.status && e.response.data) {
                const errorData = e.response.data;
                if (errorData.error) {
                    const description = errorData.error_description ?? 'The Authorization Server rejected the request';
                    throw new ClientError(e.response.status, errorData.error, description);
                }
            }

            // Handle client connectivity errors
            throw ErrorHandler.fromHttpRequestError(e, options.url);
        }
    }
}
