import axios, {AxiosRequestConfig, Method} from 'axios';
import {Guid} from 'guid-typescript';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorFactory} from '../errors/errorFactory';
import {UIError} from '../errors/uiError';
import {AxiosUtils} from '../utilities/axiosUtils';
import {ConcurrentActionHandler} from '../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../utilities/htmlStorageHelper';
import {UrlHelper} from '../utilities/urlHelper';
import {Authenticator} from './authenticator';
import {CredentialSupplier} from './credentialSupplier';
import {PageLoadResponse} from './pageLoadResponse';

/*
 * The authenticator implementation
 */
export class AuthenticatorImpl implements Authenticator, CredentialSupplier {

    private readonly _oauthAgentBaseUrl: string;
    private readonly _sessionId: string;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private _antiForgeryToken: string | null;

    public constructor(configuration: OAuthConfiguration, sessionId: string) {

        this._oauthAgentBaseUrl = configuration.oauthAgentBaseUrl;
        this._sessionId = sessionId;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._antiForgeryToken = null;
        this._setupCallbacks();
    }

    /*
     * Trigger the login redirect to the Authorization Server
     */
    public async login(currentLocation: string): Promise<void> {

        try {

            // Call the API to set up the login
            const response = await this._callOAuthAgent('POST', '/login/start', this._antiForgeryToken, null);

            // Store the app location and other state if required
            HtmlStorageHelper.appState = {
                path: currentLocation,
            };

            // Then do the redirect
            location.href = response.authorizationRequestUri;

        } catch (e) {

            throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Check for and handle login responses when the page loads
     */
    public async handlePageLoad(onPostLoginNavigate: (path: string) => void)   : Promise<boolean> {

        let appLocation = '/';
        let isLoggedIn = false;

        try {

            // Send the full URL to the Token Handler API
            const request = {
                url: location.href,
            };
            const pageLoadResponse = await this._callOAuthAgent(
                'POST',
                '/login/end',
                this._antiForgeryToken, request) as PageLoadResponse;

            // If it was handled it was an Authorization response and the SPA may need to perform actions
            if (pageLoadResponse.handled) {

                // Get the location before the redirect
                const appState = HtmlStorageHelper.appState;
                if (appState) {
                    appLocation = appState.path;
                }

                // Clean up
                HtmlStorageHelper.removeAppState();
                onPostLoginNavigate(appLocation);
            }

            // Store the anti forgery token here, where it is used for OAuth requests
            if (pageLoadResponse.antiForgeryToken) {
                this._antiForgeryToken = pageLoadResponse.antiForgeryToken;
            }

            // Return the logged in state to the rest of the app
            isLoggedIn = pageLoadResponse.isLoggedIn;

        } catch (e: any) {

            // Clean up
            onPostLoginNavigate(appLocation);

            // Report unexpected errors
            if (!this._isTokenHandlerAccessDeniedError(e)) {
                throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginResponseFailed);
            }

            // Access denied errors are expected occasionally, and result in a new user login
        }

        return isLoggedIn;
    }

    /*
     * Do the logout redirect to clear all cookie and token details
     */
    public async logout(): Promise<void> {

        try {

            const response = await this._callOAuthAgent('POST', '/logout', this._antiForgeryToken, null);
            location.href = response.endSessionRequestUri;

        } catch (e) {

            throw ErrorFactory.fromLogoutOperation(e, ErrorCodes.logoutRequestFailed);

        } finally {

            this._antiForgeryToken = null;
        }
    }

    /*
     * When a logout occurs on another browser tab, move this tab to a logged out state
     */
    public async onLoggedOut(): Promise<void> {
        this._antiForgeryToken = null;
    }

    /*
     * This method is for testing only, so that the SPA can receive expired access token responses
     */
    public async expireAccessToken(): Promise<void> {
        await this._callOAuthAgent('POST', '/expire', this._antiForgeryToken, {type: 'access'});
    }

    /*
     * This method is for testing only, so that the SPA can receive expired refresh token responses
     */
    public async expireRefreshToken(): Promise<void> {
        await this._callOAuthAgent('POST', '/expire', this._antiForgeryToken, {type: 'refresh'});
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

        // Send the anti forgery token on data changing commands
        if (options.method === 'POST'  ||
            options.method === 'PUT'   ||
            options.method === 'PATCH' ||
            options.method === 'DELETE') {

                options.headers!['x-mycompany-csrf'] = this._antiForgeryToken;
        }

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

            await this._callOAuthAgent('POST', '/refresh', this._antiForgeryToken, null);

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
    private async _callOAuthAgent(
        method: Method,
        operationPath: string,
        antiForgeryToken: string | null,
        requestData: any): Promise<any> {

        const url = UrlHelper.append(this._oauthAgentBaseUrl, operationPath);

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

            // Add the anti forgery token when we have one
            if (antiForgeryToken) {
                options.headers['x-mycompany-csrf'] = antiForgeryToken;
            }

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

            throw ErrorFactory.fromHttpError(e, url, 'Token Handler API');
        }
    }

    /*
     * When page load requests fail due to invalid cookies the token handler returns a generic 401 error
     * This could be caused by a new cookie encryption key or a redeployment of the Authorization Server
     */
    private _isTokenHandlerAccessDeniedError(e: any): boolean {

        const uiError = e as UIError;
        return uiError.statusCode === 401 && uiError.errorCode === ErrorCodes.accessDeniedError;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._performTokenRefresh = this._performTokenRefresh.bind(this);
    }
}
