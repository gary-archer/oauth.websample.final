import EventBus from 'js-event-bus';
import {Company} from '../entities/company';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {CompanyTransactions} from '../entities/companyTransactions';
import {OAuthUserInfo} from '../entities/oauthUserInfo';
import {Configuration} from '../../configuration/configuration';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {OAuthClient} from '../../plumbing/oauth/oauthClient';
import {FetchCache} from '../cache/fetchCache';
import {FetchOptions} from '../cache/fetchOptions';
import {ApiRequestCoordinator} from './apiRequestCoordinator';

/*
 * An example API client that implements infrastructure to fetch  and cache sensitive data
 */
export class ApiClient {

    private readonly configuration: Configuration;
    private readonly oauthClient: OAuthClient;
    private readonly fetchCache: FetchCache;
    private readonly requestCoordinator: ApiRequestCoordinator;

    public constructor(configuration: Configuration, oauthClient: OAuthClient, eventBus: EventBus) {

        this.configuration = configuration;
        this.oauthClient = oauthClient;
        this.fetchCache = new FetchCache();
        this.requestCoordinator = new ApiRequestCoordinator(this.fetchCache, eventBus);
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
     * Return the overall status after a batch of concurrent API requests complete
     */
    public hasErrors(): boolean {
        return this.requestCoordinator.hasErrors();
    }

    /*
     * Clear any API state when the user logs out
     */
    public clearState(): void {
        this.fetchCache.clearAll();
        this.requestCoordinator.resetState();
    }

    /*
     * The code sample's entry point for GET requests manages caching
     */
    private async getDataFromApi(url: string, options: FetchOptions): Promise<any> {

        // Remove the item from the cache when a reload is requested
        if (options.forceReload) {
            this.fetchCache.removeItem(options.cacheKey);
        }

        let cacheItem = this.fetchCache.getItem(options.cacheKey);
        if (cacheItem && !cacheItem.getError()) {

            // Return existing data from the memory cache when available
            // If React strict mode recreates the view and sends a second request, this returns null
            return cacheItem.getData();
        }

        // Ensure that the cache item exists for any re-entrant requests that fire after this one
        cacheItem = this.fetchCache.createItem(options.cacheKey);

        // Notify the request coordinator that we are sending an API request
        this.requestCoordinator.onApiRequestStart(options.cacheKey);

        let result: any;
        try {

            // Get the data and update the cache item for this request
            result = await this.getDataFromApiWithTokenRefresh(url, options);
            cacheItem.setData(result);

        } catch (e: any) {

            // Get the error and update the cache item for this request
            const error = ErrorFactory.fromException(e);
            cacheItem.setError(error);
            throw error;

        } finally {

            // Notify the request coordinator that we sent an API request
            this.requestCoordinator.onApiRequestEnd();
        }

        return result;
    }

    /*
     * This method runs a standard algorithm for token refresh
     */
    private async getDataFromApiWithTokenRefresh(url: string, options: FetchOptions): Promise<any> {

        // Avoid API requests and trigger a login redirect when we know it is needed
        if (!this.oauthClient.isLoggedIn()) {
            throw ErrorFactory.fromLoginRequired();
        }

        try {

            // Call the API and return data on success
            return await this.callApiWithCredential('GET', url, options);

        } catch (e1: any) {

            // Report errors if this is not a 401
            const error1 = ErrorFactory.fromException(e1);
            if (error1.getStatusCode() !== 401) {
                throw error1;
            }

            // Try to refresh the access token cookie
            await this.oauthClient.synchronizedRefresh();

            try {

                // Call the API again with the rewritten access token cookie
                return await this.callApiWithCredential('GET', url, options);

            }  catch (e2: any) {

                // Save retry errors
                const error2 = ErrorFactory.fromException(e2);
                if (error2.getStatusCode() !== 401) {
                    throw error2;
                }

                // A permanent API 401 error triggers a new login.
                // This could be caused by an invalid API configuration.
                this.oauthClient.clearState();
                throw ErrorFactory.fromLoginRequired();
            }
        }
    }

    /*
     * This method does the work of calling the API
     */
    private async callApiWithCredential(
        method: string,
        url: string,
        fetchOptions: FetchOptions,
        dataToSend: any = null): Promise<any> {

        // Add the token-handler-version custom header, which ensures CORS preflights.
        // Also add a correlation ID to include in API logs.
        const headers: HeadersInit = {
            'accept': 'application/json',
            'token-handler-version': '1',
            'correlation-id': crypto.randomUUID(),
        };

        // A custom header can be sent to choose a backend API that simulates a 500 error.
        // That behavior enables rehearsal of the end-to-end technical support process to resolve such errors.
        if (fetchOptions.causeError) {
            headers['api-exception-simulation'] = 'FinalApi';
        }

        // Use the credentials option to send same-site cross-origin cookies to the token handler
        const options: RequestInit = {
            method,
            credentials: 'include',
            headers,
        };

        // Send JSON data if required
        if (dataToSend) {
            headers['content-type'] = 'application/json';
            options.body = JSON.stringify(dataToSend);
        }

        try {

            // Try the request
            const response = await fetch(url, options);
            if (response.ok) {
                return await response.json();
            }

            // Handle error responses
            throw await ErrorFactory.getFromApiResponseError(response, 'web API');

        } catch (e: any) {

            // Handle connection errors
            throw ErrorFactory.getFromFetchError(e, url, 'web API');
        }
    }
}
