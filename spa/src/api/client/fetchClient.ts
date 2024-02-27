import axios, {AxiosRequestConfig, Method} from 'axios';
import {Guid} from 'guid-typescript';
import {Company} from '../entities/company';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {CompanyTransactions} from '../entities/companyTransactions';
import {OAuthUserInfo} from '../entities/oauthUserInfo';
import {Configuration} from '../../configuration/configuration';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {FetchCache} from './fetchCache';
import {FetchOptions} from './fetchOptions';

/*
 * A high level class used by the rest of the SPA to fetch cacheable secured data
 */
export class FetchClient {

    private readonly _configuration: Configuration;
    private readonly _fetchCache: FetchCache;
    private readonly _authenticator: Authenticator;
    private readonly _sessionId: string;

    public constructor(
        configuration: Configuration,
        fetchCache: FetchCache,
        authenticator: Authenticator,
        sessionId: string) {

        this._configuration = configuration;
        this._fetchCache = fetchCache;
        this._authenticator = authenticator;
        this._sessionId = sessionId;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(options: FetchOptions) : Promise<Company[] | null> {

        const url = `${this._configuration.apiBaseUrl}/companies`;
        return this._getDataFromApi(url, options);
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, options: FetchOptions) : Promise<CompanyTransactions | null> {

        const url = `${this._configuration.apiBaseUrl}/companies/${id}/transactions`;
        return this._getDataFromApi(url, options);
    }

    /*
     * Get user information from the authorization server
     */
    public async getOAuthUserInfo(options: FetchOptions) : Promise<OAuthUserInfo | null> {

        const url = `${this._configuration.oauthAgentBaseUrl}/userinfo`;
        const data = await this._getDataFromApi(url, options);
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

        const url = `${this._configuration.apiBaseUrl}/userinfo`;
        return this._getDataFromApi(url, options);
    }

    /*
     * A parameterized method containing application specific logic for managing API calls
     */
    private async _getDataFromApi(url: string, options: FetchOptions): Promise<any> {

        // Remove the item from the cache when a reload is requested
        if (options.forceReload) {
            this._fetchCache.removeItem(options.cacheKey);
        }

        // Return existing data from the memory cache when available
        // If a view is created whiles its API requests are in flight, this returns null to the view model
        let cacheItem = this._fetchCache.getItem(options.cacheKey);
        if (cacheItem && !cacheItem.error) {
            return cacheItem.data;
        }

        // Ensure that the cache item exists, to avoid a redundant API request on every view recreation
        cacheItem = this._fetchCache.createItem(options.cacheKey);

        // Avoid API requests and trigger a login redirect when we know it is needed
        if (!this._authenticator.isLoggedIn()) {

            const loginRequiredError = ErrorFactory.fromLoginRequired();
            cacheItem.error = loginRequiredError;
            throw loginRequiredError;
        }

        try {

            // Call the API and return data on success
            const data1 = await this._callApiWithCredential('GET', url, options);
            cacheItem.data = data1;
            return data1;

        } catch (e1: any) {

            const error1 = ErrorFactory.fromHttpError(e1, url, 'API');
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
                const error2 = ErrorFactory.fromHttpError(e2, url, 'API');
                cacheItem.error = error2;
                throw error2;
            }

            try {

                // Call the API again with the rewritten access token cookie
                const data2 = await this._callApiWithCredential('GET', url, options);
                cacheItem.data = data2;
                return data2;

            }  catch (e3: any) {

                // Save retry errors
                const error3 = ErrorFactory.fromHttpError(e3, url, 'API');
                cacheItem.error = error3;
                throw error3;
            }
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithCredential(
        method: Method,
        url: string,
        fetchOptions: FetchOptions,
        dataToSend: any = null): Promise<any> {

        // Values written to API logs
        const headers: any = {
            'x-mycompany-api-client':     'FinalSPA',
            'x-mycompany-session-id':     this._sessionId,
            'x-mycompany-correlation-id': Guid.create().toString(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (fetchOptions.causeError) {
            headers['x-mycompany-test-exception'] = 'SampleApi';
        }

        // Set options and send the secure cookie to the API origin
        const requestOptions = {
            url,
            method,
            data: dataToSend,
            headers,
            withCredentials: true,
        } as AxiosRequestConfig;

        // Add an anti forgery token on data changing commands
        this._authenticator.addAntiForgeryToken(requestOptions);

        // Make the API request and return the result
        const response = await axios.request(requestOptions);
        AxiosUtils.checkJson(response.data);
        return response.data;
    }
}
