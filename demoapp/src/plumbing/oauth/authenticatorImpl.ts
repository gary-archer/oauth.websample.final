import axios, {AxiosRequestConfig, Method} from 'axios';
import {Guid} from 'guid-typescript';
import {Configuration} from '../../configuration/configuration';
import {CurrentLocation} from '../../views/utilities/currentLocation';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorFactory} from '../errors/errorFactory';
import {UIError} from '../errors/uiError';
import {AxiosUtils} from '../utilities/axiosUtils';
import {BasePath} from '../utilities/basePath';
import {ConcurrentActionHandler} from '../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../utilities/htmlStorageHelper';
import {Authenticator} from './authenticator';
import {EndLoginResponse} from './endLoginResponse';
import {PageLoadResult} from './pageLoadResult';

/*
 * The authenticator implementation
 */
export class AuthenticatorImpl implements Authenticator {

    private readonly _oauthAgentBaseUrl: string;
    private readonly _sessionId: string;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private _antiForgeryToken: string | null;

    public constructor(configuration: Configuration, sessionId: string) {

        this._oauthAgentBaseUrl = configuration.oauthAgentBaseUrl;
        this._sessionId = sessionId;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._antiForgeryToken = null;
        this._setupCallbacks();
    }

    /*
     * Call the OAuth agent whenever the SPA loads
     */
    public async handlePageLoad(): Promise<PageLoadResult> {

        const result: PageLoadResult = {
            redirected: false,
        };

        try {

            // Send the page URL to the OAuth Agent to get the authentication state
            const request = {
                url: location.href,
            };
            const endLoginResponse = await this._callOAuthAgent(
                'POST',
                '/login/end',
                request) as EndLoginResponse;

            // Trigger a login if required
            if (!endLoginResponse.isLoggedIn) {

                this.login();
                result.redirected = true;
                return result;
            }

            // Store the anti forgery token here, to send during data changing API requests
            if (endLoginResponse.antiForgeryToken) {
                this._antiForgeryToken = endLoginResponse.antiForgeryToken;
            }

            if (CurrentLocation.path.toLowerCase() === '/callback') {
                result.pathToRestore = HtmlStorageHelper.getAndRemoveLoginAppCurrentPath() || '/';
            }

            return result;

        } catch (e: any) {

            // Session expired errors, where the cookie is rejected, also trigger a login
            if (this._isSessionExpiredError(e)) {

                this.login();
                result.redirected = true;
                return result;
            }

            // Rethrow other errors
            throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginResponseFailed);
        }
    }

    /*
     * Login is delegated to the shell application, and the app saves its state first
     */
    public login(): void {

        HtmlStorageHelper.loginAppBasePath = BasePath.get();
        HtmlStorageHelper.loginAppCurrentPath = CurrentLocation.path;
        location.href = `${location.origin}/login`;
    }

    /*
     * Logout is delegated to the shell application
     */
    public async logout(): Promise<void> {

        location.href = `${location.origin}/logout`;
    }

    /*
     * When a logout occurs on another browser tab, or for another micro UI, redirect to the shell app
     */
    public onLoggedOut(): void {
        this.logout();
    }

    /*
     * This method is for testing only, so that the SPA can receive expired access token responses
     */
    public async expireAccessToken(): Promise<void> {

        try {

            // Try to rewrite the refresh token within the cookie, using existing cookies as the request credential
            await this._callOAuthAgent('POST', '/expire', {type: 'access'});

        } catch (e: any) {

            // Session expired errors are silently ignored
            if (!this._isSessionExpiredError(e)) {
                throw ErrorFactory.fromTestExpiryError(e, 'access');
            }
        }
    }

    /*
     * This method is for testing only, so that the SPA can receive expired refresh token responses
     */
    public async expireRefreshToken(): Promise<void> {

        try {

            // Try to rewrite the access token within the cookie, using the existing cookies as the request credential
            await this._callOAuthAgent('POST', '/expire', {type: 'refresh'});

        } catch (e: any) {

            // Session expired errors are silently ignored
            if (!this._isSessionExpiredError(e)) {
                throw ErrorFactory.fromTestExpiryError(e, 'refresh');
            }
        }
    }

    /*
     * Deal with supplying or renewing credentials when calling an API, since the authenticator owns the CSRF token
     */
    public async onCallApi(options: AxiosRequestConfig, isRetry: boolean): Promise<void> {

        // If there is no anti forgery token then the user must sign in
        if (!this._antiForgeryToken) {
            throw ErrorFactory.fromLoginRequired();
        }

        // Send the secure cookie
        options.withCredentials = true;

        // Add the anti forgery token
        this._addAntiForgeryToken(options);

        // If retrying an API call, ask the back end for front end API to rewrite the cookie
        if (isRetry) {
            await this._concurrencyHandler.execute(this._performTokenRefresh);
        }
    }

    /*
     * Do the work of asking the token handler API to refresh the access token stored in the secure cookie
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            await this._callOAuthAgent('POST', '/refresh', null);

        } catch (e: any) {

            if (e.statusCode === 401) {
                throw ErrorFactory.fromLoginRequired();
            }

            throw ErrorFactory.fromTokenRefreshError(e);
        }
    }

    /*
     * A parameterized method for calling the OAuth agent
     */
    private async _callOAuthAgent(method: Method, operationPath: string, requestData: any): Promise<any> {

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

            // Add the anti forgery token
            this._addAntiForgeryToken(options);

            // Supply headers for the Token Handler API to write to logs
            options.headers['x-mycompany-api-client'] = 'FinalSPA';
            options.headers['x-mycompany-session-id'] = this._sessionId;
            options.headers['x-mycompany-correlation-id'] = Guid.create().toString();

            // Make the request and return the response
            const response = await axios.request(options as AxiosRequestConfig);
            if (response.data) {

                AxiosUtils.checkJson(response.data);
                return response.data;
            }

            return null;

        } catch (e) {

            throw ErrorFactory.fromHttpError(e, url, 'OAuth Agent');
        }
    }

    /*
     * Add an anti forgery token when sending data changing commands
     */
    private _addAntiForgeryToken(options: AxiosRequestConfig): void {

        if (options.method === 'POST'  ||
            options.method === 'PUT'   ||
            options.method === 'PATCH' ||
            options.method === 'DELETE') {

            (options.headers as any)['x-mycompany-csrf'] = this._antiForgeryToken;
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
