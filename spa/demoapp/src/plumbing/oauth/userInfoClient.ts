import axios, {AxiosRequestConfig} from 'axios';
import {Guid} from 'guid-typescript';
import {Configuration} from '../../configuration/configuration';
import {ErrorFactory} from '../errors/errorFactory';
import {BaseErrorFactory} from '../errors/lib';
import {HttpClientContext} from '../http/httpClientContext';
import {HttpRequestCache} from '../http/httpRequestCache';
import {AxiosUtils} from '../utilities/axiosUtils';
import {Authenticator} from './authenticator';
import {OAuthUserInfo} from './oauthUserInfo';

/*
 * A class to deal with plumbing during OAuth user info requests
 * These have similarities to API requests and are use the same type of caching
 */
export class UserInfoClient {

    private readonly _configuration: Configuration;
    private readonly _authenticator: Authenticator;
    private readonly _httpRequestCache: HttpRequestCache;
    private readonly _sessionId: string;

    public constructor(
        configuration: Configuration,
        authenticator: Authenticator,
        httpRequestCache: HttpRequestCache,
        sessionId: string) {

        this._configuration = configuration;
        this._authenticator = authenticator;
        this._httpRequestCache = httpRequestCache;
        this._sessionId = sessionId;
    }

    /*
     * Get user info from the authorization server and retry 401s
     */
    public async getUserInfo(context: HttpClientContext): Promise<OAuthUserInfo> {

        // Get the URL
        const url = `${this._configuration.oauthAgentBaseUrl}/userinfo`;

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
            const data1 = await this._makeUserInfoRequest(url);
            cacheItem.data = data1;
            return data1;

        } catch (e1: any) {

            const error1 = BaseErrorFactory.fromHttpError(e1, url, 'OAuth agent');
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
                const error2 = BaseErrorFactory.fromHttpError(e2, url, 'OAuth agent');
                cacheItem.error = error2;
                throw error2;
            }

            try {

                // Call the API again with the rewritten access token cookie
                const data2 = await this._makeUserInfoRequest(url);
                cacheItem.data = data2;
                return data2;

            }  catch (e3: any) {

                // Save retry errors
                const error3 = BaseErrorFactory.fromHttpError(e3, url, 'OAuth agent');
                cacheItem.error = error3;
                throw error3;
            }
        }
    }

    /*
     * Make a user info request to the authorization server
     */
    private async _makeUserInfoRequest(url: string): Promise<OAuthUserInfo> {

        // Same site cookies are also cross origin so the withCredentials flag is needed
        const options: any = {
            url,
            methold: 'GET',
            headers: {
                accept: 'application/json',
            },
            withCredentials: true,
        };

        // Supply headers for the Token Handler API to write to logs
        options.headers['x-mycompany-api-client'] = 'FinalSPA';
        options.headers['x-mycompany-session-id'] = this._sessionId;
        options.headers['x-mycompany-correlation-id'] = Guid.create().toString();

        // Make the request and return the response
        const response = await axios.request(options as AxiosRequestConfig);
        AxiosUtils.checkJson(response.data);

        return {
            givenName: response?.data['given_name'] || '',
            familyName: response?.data['family_name'] || '',
        };
    }
}
