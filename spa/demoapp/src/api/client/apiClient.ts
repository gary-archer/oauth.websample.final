import axios, {AxiosRequestConfig} from 'axios';
import {Guid} from 'guid-typescript';
import {Company} from '../entities/company';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {CompanyTransactions} from '../entities/companyTransactions';
import {Configuration} from '../../configuration/configuration';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {BaseErrorFactory} from '../../plumbing/errors/lib';
import {HttpRequestCache} from '../../plumbing/http/httpRequestCache';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {ApiClientContext} from './apiClientContext';

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
    public async getCompanyList(context: ApiClientContext)
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
    public async getCompanyTransactions(id: string, context: ApiClientContext)
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
    public async getUserInfo(context: ApiClientContext)
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
        context: ApiClientContext): Promise<any> {

        // Get the URL and pass it back in the context
        const url = `${this._apiBaseUrl}${path}`;
        context.url = url;

        try {
            // Call the API
            return await this._callApiWithCredential(url, method, dataToSend, context);

        } catch (e: any) {

            // Report Ajax errors if this is not a 401
            if (e.statusCode !== 401) {
                throw e;
            }

            // Refresh the access token cookie
            await this._authenticator.synchronizedRefresh();

            // Call the API again with the rewritten access token cookie
            return await this._callApiWithCredential(url, method, dataToSend, context);
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithCredential(
        url: string,
        method: string,
        dataToSend: any,
        context: ApiClientContext): Promise<any> {

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

        try {

            // Avoid the overhead of an API request when it will immediately fail
            if (!this._authenticator.isLoggedIn()) {
                throw ErrorFactory.fromLoginRequired();
            }

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
            cacheItem.data = response.data;
            return response.data;

        } catch (e: any) {

            // Get the error and save it to the cache
            const error = BaseErrorFactory.fromHttpError(e, url, 'web API');
            cacheItem.error = error;
            throw error;
        }
    }

    /*
     * Add headers for logging and advanced testing purposes
     */
    private _getHeaders(context: ApiClientContext): any {

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
