import axios, {AxiosRequestConfig} from 'axios';
import {Guid} from 'guid-typescript';
import {Company} from '../entities/company';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {CompanyTransactions} from '../entities/companyTransactions';
import {Configuration} from '../../configuration/configuration';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {BaseErrorFactory} from '../../plumbing/errors/lib';
import {HttpRequestCache} from '../../plumbing/http/HttpRequestCache';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {ApiClientOptions} from './apiClientOptions';

/*
 * A high level class used by the rest of the SPA to trigger API calls
 */
export class ApiClient {

    private readonly _apiBaseUrl: string;
    private readonly _sessionId: string;
    private readonly _authenticator: Authenticator;
    private readonly _requestCache: HttpRequestCache;

    public constructor(
        configuration: Configuration,
        sessionId: string,
        authenticator: Authenticator,
        requestCache: HttpRequestCache) {

        this._apiBaseUrl = configuration.apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._sessionId = sessionId;
        this._authenticator = authenticator;
        this._requestCache = requestCache;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(callerOptions?: ApiClientOptions)
        : Promise<Company[] | null> {

        return this._callApi(
            'companies',
            'GET',
            null,
            callerOptions);
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, callerOptions?: ApiClientOptions)
        : Promise<CompanyTransactions | null> {

        return this._callApi(
            `companies/${id}/transactions`,
            'GET',
            null,
            callerOptions);
    }

    /*
     * Download user attributes the UI needs that are not stored in the authorization server
     */
    public async getUserInfo(callerOptions?: ApiClientOptions)
        : Promise<ApiUserInfo | null> {

        return this._callApi(
            'userinfo',
            'GET',
            null,
            callerOptions);
    }

    /*
     * A parameterized method containing application specific logic for managing API calls
     */
    private async _callApi(
        path: string,
        method: string,
        dataToSend: any,
        callerOptions?: ApiClientOptions): Promise<any> {

        // Get the full request URL
        const url = `${this._apiBaseUrl}${path}`;
        const apiClientOptions = callerOptions || {
            forceReload: false,
            causeError: false,
        };

        // Avoid an API call if we know it will fail
        if (!this._authenticator.isLoggedIn()) {
            throw ErrorFactory.fromLoginRequired();
        }

        try {

            // Call the API
            return await this._callApiWithCredential(url, method, dataToSend, apiClientOptions);

        } catch (e: any) {

            // Report Ajax errors if this is not a 401
            if (e.statusCode !== 401) {
                throw e;
            }

            // Refresh the access token cookie
            await this._authenticator.synchronizedRefresh();

            // Call the API again with the rewritten access token cookie
            return await this._callApiWithCredential(url, method, dataToSend, apiClientOptions);
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithCredential(
        url: string,
        method: string,
        dataToSend: any,
        apiClientOptions: ApiClientOptions): Promise<any> {

        try {

            // Return existing data from the memory cache when available
            if (!apiClientOptions.forceReload) {
                const cachedRequest = this._requestCache.getData(url);
                if (cachedRequest) {
                    return cachedRequest.data;
                }
            }
            this._requestCache.createItem(url);

            // Set options and send the secure cookie to the API origin
            const options = {
                url,
                method,
                data: dataToSend,
                headers: this._getHeaders(apiClientOptions),
                withCredentials: true,
            } as AxiosRequestConfig;

            // Add an anti forgery token on data changing commands
            this._authenticator.addAntiForgeryToken(options);

            // Make the API request
            const response = await axios.request(options);
            AxiosUtils.checkJson(response.data);
            this._requestCache.setData(url, response.data);
            return response.data;

        } catch (e: any) {

            const error = BaseErrorFactory.fromHttpError(e, url, 'web API');
            this._requestCache.setError(url, error);
            throw error;
        }
    }

    /*
     * Add headers for logging and advanced testing purposes
     */
    private _getHeaders(apiClientOptions: ApiClientOptions): any {

        const headers: any = {

            // Context headers included in API logs
            'x-mycompany-api-client':     'FinalSPA',
            'x-mycompany-session-id':     this._sessionId,
            'x-mycompany-correlation-id': Guid.create().toString(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (apiClientOptions.causeError) {
            headers['x-mycompany-test-exception'] = 'SampleApi';
        }

        return headers;
    }
}
