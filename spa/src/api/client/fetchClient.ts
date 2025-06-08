import axios, {AxiosRequestConfig, Method} from 'axios';
import {Company} from '../entities/company';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {CompanyTransactions} from '../entities/companyTransactions';
import {OAuthUserInfo} from '../entities/oauthUserInfo';
import {Configuration} from '../../configuration/configuration';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {OAuthClient} from '../../plumbing/oauth/oauthClient';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {FetchCache} from './fetchCache';
import {FetchOptions} from './fetchOptions';

/*
 * A high level class used by the rest of the SPA to fetch cacheable secured data
 */
export class FetchClient {

    private readonly configuration: Configuration;
    private readonly fetchCache: FetchCache;
    private readonly oauthClient: OAuthClient;
    private readonly sessionId: string;

    public constructor(
        configuration: Configuration,
        fetchCache: FetchCache,
        oauthClient: OAuthClient,
        sessionId: string) {

        this.configuration = configuration;
        this.fetchCache = fetchCache;
        this.oauthClient = oauthClient;
        this.sessionId = sessionId;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(options: FetchOptions) : Promise<Company[] | null> {

        const url = `${this.configuration.bffBaseUrl}/investments/companies`;
        return this.getDataFromApi(url, options);
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, options: FetchOptions) : Promise<CompanyTransactions | null> {

        const url = `${this.configuration.bffBaseUrl}/investments/companies/${id}/transactions`;
        return this.getDataFromApi(url, options);
    }

    /*
     * Get user information from the authorization server
     */
    public async getOAuthUserInfo(options: FetchOptions) : Promise<OAuthUserInfo | null> {

        const url = `${this.configuration.bffBaseUrl}/oauthuserinfo`;
        const data = await this.getDataFromApi(url, options);
        if (!data) {
            return null;
        }

        return {
            givenName: data['given_name'] || '',
            familyName: data['family_name'] || '',
        };
    }

    /*
     * Download user attributes the UI needs that are not stored in the authorization server
     */
    public async getApiUserInfo(options: FetchOptions) : Promise<ApiUserInfo | null> {

        const url = `${this.configuration.bffBaseUrl}/investments/userinfo`;
        return this.getDataFromApi(url, options);
    }

    /*
     * A parameterized method containing application specific logic for managing API calls
     */
    private async getDataFromApi(url: string, options: FetchOptions): Promise<any> {

        // Remove the item from the cache when a reload is requested
        if (options.forceReload) {
            this.fetchCache.removeItem(options.cacheKey);
        }

        // Return existing data from the memory cache when available
        // If a view is created whiles its API requests are in flight, this returns null to the view model
        let cacheItem = this.fetchCache.getItem(options.cacheKey);
        if (cacheItem && !cacheItem.getError()) {
            return cacheItem.getData();
        }

        // Ensure that the cache item exists, to avoid a redundant API request on every view recreation
        cacheItem = this.fetchCache.createItem(options.cacheKey);

        // Avoid API requests and trigger a login redirect when we know it is needed
        if (!this.oauthClient.isLoggedIn()) {

            const loginRequiredError = ErrorFactory.fromLoginRequired();
            cacheItem.setError(loginRequiredError);
            throw loginRequiredError;
        }

        try {

            // Call the API and return data on success
            const data1 = await this.callApiWithCredential('GET', url, options);
            cacheItem.setData(data1);
            return data1;

        } catch (e1: any) {

            const error1 = ErrorFactory.fromHttpError(e1, url, 'API');
            if (error1.getStatusCode() !== 401) {

                // Report errors if this is not a 401
                cacheItem.setError(error1);
                throw error1;
            }

            try {
                // Try to refresh the access token cookie
                await this.oauthClient.synchronizedRefresh();

            } catch (e2: any) {

                // Save refresh errors
                const error2 = ErrorFactory.fromHttpError(e2, url, 'API');
                cacheItem.setError(error2);
                throw error2;
            }

            try {

                // Call the API again with the rewritten access token cookie
                const data2 = await this.callApiWithCredential('GET', url, options);
                cacheItem.setData(data2);
                return data2;

            }  catch (e3: any) {

                // Save retry errors
                const error3 = ErrorFactory.fromHttpError(e3, url, 'API');
                cacheItem.setError(error3);
                throw error3;
            }
        }
    }

    /*
     * Do the work of calling the API
     */
    private async callApiWithCredential(
        method: Method,
        url: string,
        fetchOptions: FetchOptions,
        dataToSend: any = null): Promise<any> {

        // Add the token-handler-version custom header, which is required to trigger CORS preflights
        // The other custom headers are written to API logs
        const headers: any = {
            'token-handler-version':        '1',
            'x-authsamples-api-client':     'FinalSPA',
            'x-authsamples-session-id':     this.sessionId,
            'x-authsamples-correlation-id': crypto.randomUUID(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (fetchOptions.causeError) {
            headers['x-authsamples-test-exception'] = 'FinalApi';
        }

        // Set options and send the secure cookie to the backend for frontend origin
        const requestOptions = {
            url,
            method,
            data: dataToSend,
            headers,
            withCredentials: true,
        } as AxiosRequestConfig;

        // Make the API request and return the result
        const response = await axios.request(requestOptions);
        AxiosUtils.checkJson(response.data);
        return response.data;
    }
}
