import axios, {AxiosRequestConfig} from 'axios';
import {Guid} from 'guid-typescript';
import {Company} from '../entities/company';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {CompanyTransactions} from '../entities/companyTransactions';
import {Configuration} from '../../configuration/configuration';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {BaseErrorFactory} from '../../plumbing/errors/lib';
import {HttpClientContext} from '../../plumbing/http/httpClientContext';
import {HttpRequestCache} from '../../plumbing/http/httpRequestCache';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';

/*
 * A high level class used by the rest of the SPA to trigger API calls
 */
export class ApiClient {

    private readonly _apiBaseUrl: string;
    private readonly _sessionId: string;
    private readonly _authenticator: Authenticator;
    private readonly _httpRequestCache: HttpRequestCache;

    public constructor(
        configuration: Configuration,
        authenticator: Authenticator,
        httpRequestCache: HttpRequestCache,
        sessionId: string) {

        this._apiBaseUrl = configuration.apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._sessionId = sessionId;
        this._authenticator = authenticator;
        this._httpRequestCache = httpRequestCache;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(context: HttpClientContext)
        : Promise<Company[] | null> {

        return this._callApi(
            'companies',
            'GET',
            null,
            context);
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, context: HttpClientContext)
        : Promise<CompanyTransactions | null> {

        return this._callApi(
            `companies/${id}/transactions`,
            'GET',
            null,
            context);
    }

    /*
     * Download user attributes the UI needs that are not stored in the authorization server
     */
    public async getUserInfo(context: HttpClientContext)
        : Promise<ApiUserInfo | null> {

        return this._callApi(
            'userinfo',
            'GET',
            null,
            context);
    }

    /*
     * A parameterized method containing application specific logic for managing API calls
     */
    private async _callApi(
        path: string,
        method: string,
        dataToSend: any,
        context: HttpClientContext): Promise<any> {

        // Get the URL
        const url = `${this._apiBaseUrl}${path}`;

        // Remove the item from the cache when a reload is requested
        if (context.forceReload) {
            this._httpRequestCache.removeItem(url);
        }

        // Return existing data from the memory cache when available
        let cacheItem = this._httpRequestCache.getItem(url);
        if (cacheItem && !cacheItem.error) {
            return cacheItem.data;
        }

        // Ensure that the cache item exists, to avoid a redundant API request on every view recreation
        cacheItem = this._httpRequestCache.createItem(url);

        // Inform the caller that a URL is being called
        context.addUrl(url);

        try {

            // Avoid the overhead of an API request when it will immediately fail
            if (!this._authenticator.isLoggedIn()) {
                throw ErrorFactory.fromLoginRequired();
            }

            // Call the API and return data on success
            const data1 = await this._callApiWithCredential(url, method, dataToSend, context);
            cacheItem.data = data1;
            return data1;

        } catch (e1: any) {

            const error1 = BaseErrorFactory.fromHttpError(e1, url, 'web API');
            if (error1.statusCode !== 401) {

                // Report errors if this is not a 401
                cacheItem.error = error1;
                throw error1;
            }

            try {
                // Try to refresh the access token cookie
                await this._authenticator.synchronizedRefresh();

            } catch (e2: any) {

                // Save refresh errors
                const error2 = BaseErrorFactory.fromHttpError(e2, url, 'web API');
                cacheItem.error = error2;
                throw error2;
            }

            try {

                // Call the API again with the rewritten access token cookie
                const data2 = await this._callApiWithCredential(url, method, dataToSend, context);
                cacheItem.data = data2;
                return data2;

            }  catch (e3: any) {

                // Save retry errors
                const error3 = BaseErrorFactory.fromHttpError(e3, url, 'web API');
                cacheItem.error = error3;
                throw error3;
            }
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithCredential(
        url: string,
        method: string,
        dataToSend: any,
        context: HttpClientContext): Promise<any> {

        // Set options and send the secure cookie to the API origin
        const options = {
            url,
            method,
            data: dataToSend,
            headers: this._getHeaders(context),
            withCredentials: true,
        } as AxiosRequestConfig;

        // Add an anti forgery token on data changing commands
        this._authenticator.addAntiForgeryToken(options);

        // Make the API request
        const response = await axios.request(options);
        AxiosUtils.checkJson(response.data);

        // Update the cache and return the result
        return response.data;
    }

    /*
     * Add headers for logging and advanced testing purposes
     */
    private _getHeaders(context: HttpClientContext): any {

        const headers: any = {

            // Context headers included in API logs
            'x-mycompany-api-client':     'FinalSPA',
            'x-mycompany-session-id':     this._sessionId,
            'x-mycompany-correlation-id': Guid.create().toString(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (context.causeError) {
            headers['x-mycompany-test-exception'] = 'SampleApi';
        }

        return headers;
    }
}
