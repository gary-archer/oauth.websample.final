import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {URLSearchParams} from 'url';
import {Request, Response} from 'express';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ClientError} from '../errors/clientError';
import {ErrorHandler} from '../errors/errorHandler';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * The proxy service class will deal with routing requests to the Authorization Server
 */
export class ProxyService {

    private readonly _configuration: OAuthConfiguration;

    public constructor(configuration: OAuthConfiguration) {
        this._configuration = configuration;
    }

    /*
     * Forward the authorization code grant message to the Authorization Server
     */
    public async sendAuthorizationCodeGrant(request: Request, response: Response): Promise<any> {

        return this._postMessage(request.headers, request.body, response);
    }

    /*
     * Forward the refresh token grant message to the Authorization Server
     */
    public async sendRefreshTokenGrant(refreshToken: string, request: Request, response: Response): Promise<any>  {

        return this._postMessage(request.headers, request.body, response);
    }

    /*
     * Route a message to the Authorization Server
     */
    private async _postMessage(headers: any, jsonData: any, response: Response): Promise<void> {

        // Get form URL encoded data
        const formData = new URLSearchParams();
        for (const field in jsonData) {
            if (field && jsonData[field]) {
                formData.append(field, jsonData[field]);
            }
        }

        // Define request options
        const options = {
            url: this._configuration.tokenEndpoint,
            method: 'POST',
            data: formData,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'accept': 'application/json',
            },
            httpsAgent: HttpProxy.get(),
        };

        try {

            // Call the Authorization Server
            const authServerResponse = await axios.request(options as AxiosRequestConfig);

            // Handle success responses
            response.status(authServerResponse.status);
            response.setHeader('content-type', 'application/json');
            return authServerResponse.data;

        } catch (e) {

            // Handle OAuth error responses
            if (e.response && e.response.status && e.response.data) {
                const errorData = e.response.data;
                if (errorData.error && errorData.error_description) {
                    throw new ClientError(e.response.status, errorData.error, errorData.error_description);
                }
            }

            // Handle client connectivity errors
            throw ErrorHandler.fromRequestError(e);
        }
    }
}
