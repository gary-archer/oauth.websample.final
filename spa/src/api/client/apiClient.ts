import axios, {Method} from 'axios';
import {Guid} from 'guid-typescript';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {SessionManager} from '../../plumbing/utilities/sessionManager';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {UserInfoClaims} from '../entities/userInfoClaims';
import {ApiRequestOptions} from './apiRequestOptions';

/*
 * Logic related to making API calls
 */
export class ApiClient {

    private readonly _apiBaseUrl: string;
    private readonly _authenticator: Authenticator;
    private readonly _sessionId: string;

    public constructor(apiBaseUrl: string, authenticator: Authenticator) {

        this._apiBaseUrl = apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._authenticator = authenticator;
        this._sessionId = SessionManager.get();
    }

    /*
     * We download user info from the API rather than using the id token
     */
    public async getUserInfo(options?: ApiRequestOptions): Promise<UserInfoClaims> {

        return await this._callApi('userinfo', 'GET', null, options) as UserInfoClaims;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(options?: ApiRequestOptions): Promise<Company[]> {

        return await this._callApi('companies', 'GET', null, options) as Company[];
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, options?: ApiRequestOptions): Promise<CompanyTransactions> {

        return await this._callApi(`companies/${id}/transactions`, 'GET', null, options) as CompanyTransactions;
    }

    /*
     * A central method to get data from an API and handle 401 retries
     */
    private async _callApi(
        path: string,
        method: Method,
        dataToSend?: any,
        options?: ApiRequestOptions): Promise<any> {

        // Get the full path
        const url = `${this._apiBaseUrl}${path}`;

        // Get the access token, and if it does not exist a login redirect will be triggered
        let token = await this._authenticator.getAccessToken();

        try {

            // Call the API
            return await this._callApiWithToken(url, method, dataToSend, token, options);

        } catch (error1) {

            // Report Ajax errors if this is not a 401
            if (!this._isApi401Error(error1)) {
                throw ErrorHandler.getFromHttpError(error1, url, 'Web API');
            }

            // If we received a 401 then try to get a new token
            token = await this._authenticator.refreshAccessToken();

            // The general pattern for calling an OAuth secured API is to retry 401s once with a new token
            try {
                // Call the API again
                return await this._callApiWithToken(url, method, dataToSend, token, options);

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
        options?: ApiRequestOptions): Promise<any> {

        // Force IE11 to bypass the browser cache by changing the request URL every time
        let requestUrl = url;
        if (navigator.userAgent.toLowerCase().indexOf('trident') !== -1) {
            requestUrl += `?time=${new Date().getTime()}`;
        }

        const response = await axios.request({
            url: requestUrl,
            method,
            data: dataToSend,
            headers: this._getHeaders(accessToken, options),
        });
        AxiosUtils.checkJson(response.data);
        return response.data;
    }

    /*
     * Add headers for logging and advanced testing purposes
     */
    private _getHeaders(accessToken: any, options?: ApiRequestOptions): any {

        const headers: any = {

            // The required authorization header
            'Authorization': `Bearer ${accessToken}`,

            // Context headers included in API logs
            'x-mycompany-api-client':     'FinalSPA',
            'x-mycompany-session-id':     this._sessionId,
            'x-mycompany-correlation-id': Guid.create().toString(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (options && options.causeError) {
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
