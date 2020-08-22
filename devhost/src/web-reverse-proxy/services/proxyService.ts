import axios, {AxiosRequestConfig} from 'axios';
import {URLSearchParams} from 'url';
import {Request, Response} from 'express';
import {ClientError} from '../errors/clientError';
import {ErrorHandler} from '../errors/errorHandler';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * The proxy service class will deal with routing requests to the Authorization Server
 */
export class ProxyService {

    private readonly _tokenEndpoint: string;

    public constructor(tokenEndpoint: string) {
        this._tokenEndpoint = tokenEndpoint;
    }

    /*
     * Forward the authorization code grant message to the Authorization Server
     */
    public async sendAuthorizationCodeGrant(request: Request, response: Response): Promise<any> {

        const formData = new URLSearchParams();
        for (const field in request.body) {
            if (field && request.body[field]) {
                formData.append(field, request.body[field]);
            }
        }

        return this._postMessage(formData, response);
    }

    /*
     * Forward the refresh token grant message to the Authorization Server
     */
    public async sendRefreshTokenGrant(refreshToken: string, request: Request, response: Response): Promise<any>  {

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
     * Route a message to the Authorization Server
     */
    private async _postMessage(formData: URLSearchParams, response: Response): Promise<void> {

        // Define request options
        const options = {
            url: this._tokenEndpoint,
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

            // Update the response for the success case and return data
            response.status(authServerResponse.status);
            response.setHeader('content-type', 'application/json');
            return authServerResponse.data;

        } catch (e) {

            // Handle errors
            this._reportAuthorizationServerError(e, options.url);
        }
    }

    /*
     * Do the work of collecting OAuth errors
     */
    private _reportAuthorizationServerError(e: any, url: string): void {

        // Handle OAuth error responses if we have data
        if (e.response && e.response.status && e.response.data) {

            // Get error values and note that error / error_description are the standard values
            // Okta may use non standard fields of errorCode / errorSummary in places though
            const errorData = e.response.data;
            const errorCode = errorData.error || errorData.errorCode;
            const errorDescription = errorData.error_description || errorData.errorSummary;

            if (errorCode) {

                // Throw the error
                throw new ClientError(
                    e.response.status,
                    errorCode,
                    errorDescription || 'The Authorization Server rejected the request');
            }
        }

        // Handle client connectivity errors
        throw ErrorHandler.fromHttpRequestError(e, url);
    }
}
