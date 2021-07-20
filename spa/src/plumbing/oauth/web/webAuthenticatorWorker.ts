import axios, {AxiosRequestConfig, Method} from 'axios';
import {Guid} from 'guid-typescript';
import {Configuration} from '../../../configuration/configuration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {AxiosUtils} from '../../utilities/axiosUtils';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {SessionManager} from '../../utilities/sessionManager';
import {UrlHelper} from '../../utilities/urlHelper';
import {Authenticator} from '../authenticator';

/*
 * An authenticator class that runs in a web worker
 */
export class WebAuthenticatorWorker implements Authenticator {

    private readonly _proxyApiBaseUrl: string;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private readonly _sessionId: string;
    private _accessToken: string | null;

    public constructor(configuration: Configuration) {

        this._proxyApiBaseUrl = configuration.oauthProxyApiBaseUrl;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._sessionId = SessionManager.get();
        this._accessToken = null;
        this._setupCallbacks();
    }

    /*
     * Called from the ApiFetch class, which uses an instance of this class running in a web worker
     */
    public async getAccessToken(): Promise<string> {

        if (this._accessToken) {
            return this._accessToken;
        }

        return this.refreshAccessToken();
    }

    /*
     * Called form the ApiFetch class to refresh an access token in a synchronised manner across multiple views
     * The auth cookie is sent to the Proxy API, which returns an access token or an invalid_grant error
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
     * Trigger the login redirect to the Authorization Server, and the SPA is in control
     */
    public async login(): Promise<void> {

        throw new Error('login is not implemented in the web worker implementation');
    }

    /*
     * Check for and handle login responses when the page loads
     */
    public async handlePageLoad(): Promise<void> {

        throw new Error('handlePageLoad is not implemented in the web worker implementation');
    }

    /*
     * Do the logout redirect to clear all cookie and token details
     */
    public async logout(): Promise<void> {

        throw new Error('logout is not implemented in the web worker implementation');
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
     * This method is for testing only, to ask the Proxy API to invalidate the refresh token in the auth cookie
     */
    public async expireRefreshToken(): Promise<void> {

        throw new Error('expireRefreshToken is not implemented in the web worker implementation');
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
        this._performTokenRefresh = this._performTokenRefresh.bind(this);
    }
}
