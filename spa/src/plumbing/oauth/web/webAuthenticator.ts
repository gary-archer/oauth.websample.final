import axios, {AxiosRequestConfig, Method} from 'axios';
import {proxy, Remote, wrap} from 'comlink';
import {Guid} from 'guid-typescript';
import {Configuration} from '../../../configuration/configuration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {UIError} from '../../errors/uiError';
import {AxiosUtils} from '../../utilities/axiosUtils';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {SessionManager} from '../../utilities/sessionManager';
import {SecureWorker} from '../../worker/secureWorker';
import {UrlHelper} from '../../utilities/urlHelper';
import {Authenticator} from '../authenticator';

/*
 * A web authenticator with standard behaviour that can be extended via a subclass
 */
export class WebAuthenticator implements Authenticator {

    private readonly _proxyApiBaseUrl: string;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private _secureWorker: Remote<SecureWorker> | null;
    private readonly _sessionId: string;

    public constructor(configuration: Configuration) {

        this._proxyApiBaseUrl = configuration.oauthProxyApiBaseUrl;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._secureWorker = null;
        this._sessionId = SessionManager.get();
        this._setupCallbacks();
    }

    /*
     * Set up a web worker to isolate the storage of access tokens
     */
    public async initializeWebWorker(worker: Worker): Promise<void> {

        const RemoteSecureWorker = wrap<typeof SecureWorker>(worker);
        this._secureWorker = await new RemoteSecureWorker(proxy(this._refreshAccessToken));
    }

    /*
     * Commands that use the access token are run in the web worker's isolated context
     */
    public async callApiWithAccessToken(action: (token: string) => Promise<any>): Promise<void> {
        
        try {
        
            return await this._secureWorker!.callApiWithAccessToken(proxy(action));

        } catch (e) {

            console.log('*** API call failed: got exception from web worker');
            const error = e as UIError;
            if (error) {
                console.log(`*** Web worker error has lost its code: ${error.errorCode}`);
            }

            throw e;
        }
    }

    /*
     * This runs within a web worker and tries to refresh an access token
     * The auth cookie is sent to the Proxy API, which returns an access token or an invalid_grant error
     * Calls are also synchronized for multiple views via the concurrency handler
     */
    private async _refreshAccessToken(): Promise<string> {

        let accessToken: string | null = null;

        const performTokenRefresh = async () => {
            
            try {

                const response = await this._callProxyApi('POST', '/token', null);
                HtmlStorageHelper.antiForgeryToken = response.antiForgeryToken;
                accessToken = response.accessToken;
    
            } catch (e) {
    
                if (!this._isExpectedTokenRefreshError(e)) {
                    throw ErrorHandler.getFromTokenRefreshError(e);
                }
            }
        }
        
        if (HtmlStorageHelper.antiForgeryToken) {
            await this._concurrencyHandler.execute(performTokenRefresh);
        }

        if (!accessToken) {
            throw ErrorHandler.getFromLoginRequired();
        }

        return accessToken;
    }

    /*
     * Trigger the login redirect to the Authorization Server, and the SPA is in control
     */
    public async login(): Promise<void> {

        try {

            // Call the API to set up the login
            const response = await this._callProxyApi('POST', '/login/start', null);

            // Store the app location and other state if required
            HtmlStorageHelper.appState = {
                hash: location.hash || '#',
            };

            // Then do the redirect
            location.href = response.authorizationRequestUri;

        } catch (e) {

            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Check for and handle login responses when the page loads
     */
    public async handlePageLoad(): Promise<void> {

        let appLocation = '#';
        try {

            // Send the full URL to the proxy API
            const request = {
                url: location.href,
            };
            const response = await this._callProxyApi('POST', '/login/end', request);

            // If it was handled it was an Authorization response and the SPA may need to perform actions
            if (response.handled) {

                // The response includes an anti forgery token to use with the secure cookie
                HtmlStorageHelper.antiForgeryToken = response.antiForgeryToken;

                // Get the location before the redirect
                const appState = HtmlStorageHelper.appState;
                if (appState) {
                    appLocation = appState.hash;
                }

                // Remove session storage and the OAuth details from back navigation
                HtmlStorageHelper.removeAppState();
                history.replaceState({}, document.title, appLocation);
            }

        } catch (e) {

            // See if this is an OAuth response error as opposed to a general HTTP problem
            const uiError = e as UIError;
            if (uiError && uiError.errorCode === ErrorCodes.loginResponseFailed) {

                // Remove the code / error details from the browser and back navigation
                history.replaceState({}, document.title, appLocation);
            }

            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);
        }
    }

    /*
     * Do the logout redirect to clear all cookie and token details
     */
    public async logout(): Promise<void> {

        try {

            const response = await this._callProxyApi('POST', '/logout/start', null);
            location.href = response.endSessionRequestUri;

        } catch (e) {

            throw ErrorHandler.getFromLogoutOperation(e, ErrorCodes.logoutRequestFailed);

        } finally {

            await this._secureWorker!.clearAccessToken();
            HtmlStorageHelper.removeAntiForgeryToken();
        }
    }

    /*
     * This method is for testing only, to make the access token receive a 401 response from the API
     */
    public async expireAccessToken(): Promise<void> {
        await this._secureWorker!.expireAccessToken();
    }

    /*
     * This method is for testing only, to ask the Proxy API to invalidate the refresh token in the auth cookie
     */
    public async expireRefreshToken(): Promise<void> {

        await this._secureWorker!.clearAccessToken();
        await this._callProxyApi('POST', '/token/expire', null);
    }

    /*
     * Call the OAuth Proxy API to perform an OAuth operation, sending cookie credentials and an anti forgery token
     */
    private async _callProxyApi(method: Method, operationPath: string, requestData: any): Promise<any> {

        const url = UrlHelper.append(this._proxyApiBaseUrl, operationPath);
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

            // Add an anti forgery token when we have one
            const aft = HtmlStorageHelper.antiForgeryToken;
            if (aft) {
                options.headers['x-mycompany-aft-finalspa'] = aft;
            }

            // Supply headers for the proxy API to write to logs
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

            throw ErrorHandler.getFromHttpError(e, url, 'OAuth Proxy API');
        }
    }

    /*
     * Check for errors that mean the session is expired normally
     */
    private _isExpectedTokenRefreshError(error: any): boolean {
        return error.statusCode === 400 &&
               (error.errorCode === ErrorCodes.cookieNotFound ||
                error.errorCode === ErrorCodes.invalidData    ||
                error.errorCode === ErrorCodes.invalidGrant);
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._refreshAccessToken = this._refreshAccessToken.bind(this);
    }
}
