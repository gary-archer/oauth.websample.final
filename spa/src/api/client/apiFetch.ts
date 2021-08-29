import axios, {Method} from 'axios';
import {Guid} from 'guid-typescript';
import {AppConfiguration} from '../../configuration/appConfiguration';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {AccessTokenSupplier} from '../../plumbing/oauth/accessTokenSupplier';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {ApiFetchOptions} from './apiFetchOptions';

/*
 * Lower level logic related to calling APIs
 */
export class ApiFetch {

    private readonly _apiBaseUrl: string;
    private readonly _accessTokenSupplier: AccessTokenSupplier;
    private readonly _sessionId: string;

    public constructor(configuration: AppConfiguration, sessionId: string, accessTokenSupplier: AccessTokenSupplier) {

        this._apiBaseUrl = configuration.apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._sessionId = sessionId;
        this._accessTokenSupplier = accessTokenSupplier;
    }

    /*
     * A parameterized method containing application specific logic for managing API calls
     */
    public async fetch(options: ApiFetchOptions): Promise<any> {

        // Get the full path
        const url = `${this._apiBaseUrl}${options.path}`;

        // Get the access token, and if it does not exist a login redirect will be triggered
        let token = await this._accessTokenSupplier.getAccessToken();

        try {

            // Call the API
            return await this._callApiWithToken(
                url,
                options.method,
                options.dataToSend,
                token,
                options.causeError);

        } catch (error1) {

            // Report Ajax errors if this is not a 401
            if (!this._isApi401Error(error1)) {
                throw ErrorHandler.getFromHttpError(error1, url, 'Web API');
            }

            // If we received a 401 then try to get a new token
            token = await this._accessTokenSupplier.refreshAccessToken();

            try {

                // The general pattern for calling an OAuth secured API is to retry 401s once with a new token
                return await this._callApiWithToken(
                    url,
                    options.method,
                    options.dataToSend,
                    token,
                    options.causeError);

            } catch (error2) {

                // Report Ajax errors for the retry
                throw ErrorHandler.getFromHttpError(error2, url, 'Web API');
            }
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithToken(
        url: string,
        method: Method,
        dataToSend: any,
        accessToken: string,
        causeError?: boolean | undefined): Promise<any> {

        const response = await axios.request({
            url,
            method,
            data: dataToSend,
            headers: this._getHeaders(accessToken, causeError),
        });
        AxiosUtils.checkJson(response.data);
        return response.data;
    }

    /*
     * Add headers for logging and advanced testing purposes
     */
    private _getHeaders(accessToken: any, causeError?: boolean | undefined): any {

        const headers: any = {

            // The required authorization header
            'Authorization': `Bearer ${accessToken}`,

            // Context headers included in API logs
            'x-mycompany-api-client':     'FinalSPA',
            'x-mycompany-session-id':     this._sessionId,
            'x-mycompany-correlation-id': Guid.create().toString(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (causeError) {
            headers['x-mycompany-test-exception'] = 'SampleApi';
        }

        return headers;
    }

    /*
     * API 401s are handled via a retry with a new token
     */
    private _isApi401Error(error: any) {

        if (error.response && error.response.status === 401) {
            return true;
        }

        return false;
    }
}
