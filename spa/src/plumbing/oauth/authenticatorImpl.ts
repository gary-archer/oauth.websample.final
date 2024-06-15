import axios, {AxiosRequestConfig, Method} from 'axios';
import {Guid} from 'guid-typescript';
import {Configuration} from '../../configuration/configuration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorFactory} from '../errors/errorFactory';
import {UIError} from '../errors/uiError';
import {AxiosUtils} from '../utilities/axiosUtils';
import {ConcurrentActionHandler} from '../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../utilities/htmlStorageHelper';
import {Authenticator} from './authenticator';
import {EndLoginResponse} from './endLoginResponse';

/*
 * The authenticator implementation
 */
export class AuthenticatorImpl implements Authenticator {

    private readonly _oauthAgentBaseUrl: string;
    private readonly _concurrencyHandler: ConcurrentActionHandler;

    public constructor(configuration: Configuration) {

        this._oauthAgentBaseUrl = configuration.oauthAgentBaseUrl;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._setupCallbacks();
    }

    /*
     * Use the CSRF token in storage as an indicator of whether logged in
     */
    public isLoggedIn(): boolean {
        return !!HtmlStorageHelper.csrfToken;
    }

    /*
     * Trigger the login redirect to the authorization server
     */
    public async login(currentLocation: string): Promise<void> {

        try {

            // Call the API to set up the login
            const response = await this._callOAuthAgent('POST', '/login/start');

            // Store the app location before the login redirect
            HtmlStorageHelper.preLoginLocation = currentLocation;

            // Then redirect the main window
            location.href = response.authorizationRequestUrl;

        } catch (e) {

            throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Check for and handle login responses when the page loads
     */
    public async handlePageLoad(): Promise<string | null> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        if (location.search) {

            const args = new URLSearchParams(location.search);
            const state = args.get('state');
            if (state) {

                try {

                    // Send the full URL to the OAuth agent API
                    const request = {
                        pageUrl: location.href,
                    };
                    const response = await this._callOAuthAgent(
                        'POST',
                        '/login/end',
                        request) as EndLoginResponse;

                    // Check for expected data in the response
                    if (!response.handled || !response.csrf) {
                        throw ErrorFactory.fromInvalidLoginResponse();
                    }

                    // I store the CSRF token in local storage, which a CSRF attack cannot exploit
                    // This reduces requests when using multi-tab browsing
                    HtmlStorageHelper.csrfToken = response.csrf;

                    // Once login is complete, return the SPA to the pre-login location
                    return HtmlStorageHelper.getAndRemovePreLoginLocation() || '/';

                } catch (e: any) {

                    // Session expired errors can be caused by browser cookies using an old encryption key
                    // Handle these by returning a default result
                    // API calls will then fail and a new login redirect will be triggered, to get updated cookies
                    if (this._isSessionExpiredError(e)) {
                        return null;
                    }

                    // Rethrow other errors
                    throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginResponseFailed);
                }
            }
        }

        // Return a no-op result by default
        return null;
    }

    /*
     * Do the logout redirect to clear all cookie and token details
     */
    public async logout(): Promise<void> {

        try {

            const response = await this._callOAuthAgent('POST', '/logout');
            this.clearLoginState();
            location.href = response.url;

        } catch (e) {

            throw ErrorFactory.fromLogoutOperation(e, ErrorCodes.logoutRequestFailed);
        }
    }

    /*
     * Allow the login state to be cleared when required
     */
    public clearLoginState(): void {
        HtmlStorageHelper.clearAntiForgeryToken();
    }

    /*
     * Add the CSRF token when sending data changing commands to APIs or the OAuth agent
     */
    public addCsrfToken(options: AxiosRequestConfig): void {

        if (options.method === 'POST'  ||
            options.method === 'PUT'   ||
            options.method === 'PATCH' ||
            options.method === 'DELETE') {

            if (HtmlStorageHelper.csrfToken) {
                (options.headers as any)['x-mycompany-csrf'] = HtmlStorageHelper.csrfToken;
            }
        }
    }

    /*
     * Synchronize a refresh call to the OAuth agent, which will rewrite cookies
     */
    public async synchronizedRefresh(): Promise<void> {
        await this._concurrencyHandler.execute(this._performTokenRefresh);
    }

    /*
     * This method is for testing only, so that the SPA can simulate expired access tokens
     */
    public async expireAccessToken(): Promise<void> {

        try {

            // Rewrite the access token within the cookie, using existing cookies as the request credential
            await this._callOAuthAgent('POST', '/access/expire');

        } catch (e: any) {

            // Session expired errors are silently ignored
            if (!this._isSessionExpiredError(e)) {
                throw ErrorFactory.fromTestExpiryError(e, 'access');
            }
        }
    }

    /*
     * This method is for testing only, so that the SPA can simulate expired refresh tokens
     */
    public async expireRefreshToken(): Promise<void> {

        try {

            // Rewrite the refresh token within the cookie, using the existing cookies as the request credential
            await this._callOAuthAgent('POST', '/refresh/expire');

        } catch (e: any) {

            // Session expired errors are silently ignored
            if (!this._isSessionExpiredError(e)) {
                throw ErrorFactory.fromTestExpiryError(e, 'refresh');
            }
        }
    }

    /*
     * Do the work of asking the OAuth agent API to refresh the access token stored in the secure cookie
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            await this._callOAuthAgent('POST', '/refresh', null);

        } catch (e: any) {

            if (e.statusCode === 401) {
                this.clearLoginState();
                throw ErrorFactory.fromLoginRequired();
            }

            throw ErrorFactory.fromTokenRefreshError(e);
        }
    }

    /*
     * A parameterized method for calling the OAuth agent
     */
    private async _callOAuthAgent(method: Method, operationPath: string, requestData: any = null): Promise<any> {

        const url = `${this._oauthAgentBaseUrl}${operationPath}`;
        try {

            // Same site cookies are also cross origin so the withCredentials flag is needed
            const options: any = {
                url,
                method,
                headers: {
                    accept: 'application/json',
                },
                withCredentials: true,
            };

            // Post data unless the payload is empty
            if (requestData) {
                options.data = requestData;
                options.headers['content-type'] = 'application/json';
            }

            // Add the CSRF token
            this.addCsrfToken(options);

            // Make the request and return the response
            const response = await axios.request(options as AxiosRequestConfig);
            if (response.data) {

                AxiosUtils.checkJson(response.data);
                return response.data;
            }

            return null;

        } catch (e: any) {

            throw ErrorFactory.fromHttpError(e, url, 'OAuth agent');
        }
    }

    /*
     * When operations fail due to invalid cookies, the OAuth proxy will return a 401 during API calls
     * This could also be caused by a new cookie encryption key or a redeployment of the Authorization Server
     */
    private _isSessionExpiredError(e: any): boolean {

        const uiError = e as UIError;
        return uiError.statusCode === 401;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._performTokenRefresh = this._performTokenRefresh.bind(this);
    }
}
