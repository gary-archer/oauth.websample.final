import axios, {AxiosRequestConfig, Method} from 'axios';
import urlparse from 'url-parse';
import {Configuration} from '../../../configuration/configuration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {AxiosUtils} from '../../utilities/axiosUtils';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {UrlHelper} from '../../utilities/urlHelper';
import {Authenticator} from '../authenticator';

/*
 * A web authenticator with standard behaviour that can be extended via a subclass
 */
export class WebAuthenticator implements Authenticator {

    private readonly _proxyApiBaseUrl: string;
    private readonly _onLoggedOut: () => void;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private _accessToken: string | null;

    public constructor(configuration: Configuration, onLoggedOut: () => void) {

        this._proxyApiBaseUrl = configuration.oauthProxyApiBaseUrl;
        this._onLoggedOut = onLoggedOut;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._accessToken = null;
        this._setupCallbacks();
    }

    /*
     * Get an access token if possible, which will retrieve it from storage
     */
    public async getAccessToken(): Promise<string> {

        if (this._accessToken) {
            return this._accessToken;
        }

        return this.refreshAccessToken();
    }

    /*
     * Try to refresh an access token in a synchronised manner across multiple views
     */
    public async refreshAccessToken(): Promise<string> {

        if (HtmlStorageHelper.antiForgeryToken) {

            await this._concurrencyHandler.execute(this._performTokenRefresh);
            if (this._accessToken) {
                return this._accessToken;
            }
        }

        throw ErrorHandler.getFromLoginRequired();
    }

    /*
     * Trigger the login redirect to the Authorization Server
     */
    public async login(): Promise<void> {

        try {

            // Call the API to set up the login
            const response = await this._callProxyApi('POST', '/login/start', null);

            // Store the app location and other state if required
            HtmlStorageHelper.appState = {
                hash: location.hash,
            }

            // Then do the redirect
            location.href = response.authorizationRequestUri;

        } catch (e) {

            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle login responses when we return from the redirect
     */
    public async handleLoginResponse(): Promise<void> {

        // When the page loads, parse its query parameters to check for login responses
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state && (urlData.query.code || urlData.query.error)) {

            // Get the location before the redirect
            let restoredLocation = '#';
            const appState = HtmlStorageHelper.appState;
            if (appState) {
                restoredLocation = appState.hash;
            }

            try {

                // Handle error responses
                if (urlData.query.error) {

                    const errorCode = urlData.query.error;
                    const errorDescription =
                        urlData.query.error_description ?? 'Login failed at the Authorization Server';
                    throw ErrorHandler.getFromLoginOperation(new Error(errorDescription), errorCode);
                }

                // Get details received from the Authorization Server
                const request = {
                    code: urlData.query.code,
                    state: urlData.query.state,
                };

                // Complete the login, to write HTTP only secure AES256 encrypted same site cookies containing tokens
                // We must store the anti forgery token to use with the cookie
                const response = await this._callProxyApi('POST', '/login/end', request);
                HtmlStorageHelper.antiForgeryToken = response.antiForgeryToken;

            } catch (e) {

                // Handle errors returned from the API
                throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);

                
            } finally {

                // Clean up temporary state and remove OAuth details from back navigation
                HtmlStorageHelper.removeAppState();
                history.replaceState({}, document.title, restoredLocation);
            }
        }
    }

    /*
     * Clear Do the logout redirect
     */
    public async logout(): Promise<void> {

        try {

            const response = await this._callProxyApi('POST', '/logout/start', null);
            location.href = response.endSessionRequestUri;

        } catch (e) {

            throw ErrorHandler.getFromLogoutOperation(e, ErrorCodes.logoutRequestFailed);

        } finally {

            HtmlStorageHelper.removeAntiForgeryToken();
        }
    }

    /*
     * This method is for testing only, to make the access token receive a 401 response from the API
     */
    public async expireAccessToken(): Promise<void> {

        if (this._accessToken) {
            this._accessToken = `x${this._accessToken}x`;
        }
    }

    /*
     * For testing, call the API to make the refresh token act like it is expired
     */
    public async expireRefreshToken(): Promise<void> {
        this._accessToken = null;
        await this._callProxyApi('POST', '/token/expire', null);
    }

    /*
     * Do the work of getting an access token by sending an auth cookie containing a refresh token
     * Expected errors fall through to the calling function and result in redirecting the user to re-authenticate
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            const response = await this._callProxyApi('POST', '/token', null);
            this._accessToken = response.accessToken;
            HtmlStorageHelper.antiForgeryToken = response.antiForgeryToken;

        } catch (e) {

            if (!this._isExpectedTokenRefreshError(e)) {
                throw ErrorHandler.getFromTokenRefreshError(e);
            }
        }
    }

    /*
     * Call the OAuth Proxy API to perform an OAuth operation, sending cookie credentials and an anti forgery token
     * Note that the cookie is same site but cross origin, so the withCredentials flag is needed
     */
    private async _callProxyApi(method: Method, operationPath: string, requestData: any): Promise<any> {

        const url = UrlHelper.append(this._proxyApiBaseUrl, operationPath);
        try {

            const options: any = {
                url,
                method,
                headers: {
                    accept: 'application/json',
                },
                withCredentials: true,
            };

            if (requestData) {
                options.data = requestData;
                options.headers['content-type'] = 'application/json';
            }

            const aft = HtmlStorageHelper.antiForgeryToken;
            if (aft) {
                options.headers['x-mycompany-aft-finalspa'] = aft;
            }

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
     * Check for a known HTTP status and error code from the Proxy API
     */
    private _isExpectedTokenRefreshError(error: any): boolean {
        return error.statusCode === 400 &&
               (error.errorCode === ErrorCodes.authCookieNotFound || error.errorCode === ErrorCodes.invalidGrant);
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._performTokenRefresh = this._performTokenRefresh.bind(this);
    }
}
