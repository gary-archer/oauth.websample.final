import axios, {AxiosRequestConfig, Method} from 'axios';
import urlparse from 'url-parse';
import {Configuration} from '../../../configuration/configuration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {UrlHelper} from '../../utilities/urlHelper';
import {Authenticator} from '../authenticator';

/*
 * A web authenticator with standard behaviour that can be extended via a subclass
 */
export class WebAuthenticator implements Authenticator {

    private readonly _proxyApiBaseUrl: string;
    private readonly _onLoggedOut: () => void;
    private _accessToken: string | null;

    public constructor(configuration: Configuration, onLoggedOut: () => void) {
        this._proxyApiBaseUrl = configuration.oauthProxyApiBaseUrl;
        this._onLoggedOut = onLoggedOut;
        this._accessToken = null;
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

        throw ErrorHandler.getFromLoginRequired();
    }

    /*
     * Trigger the login redirect to the Authorization Server
     */
    public async login(): Promise<void> {

        try {

            // Try to call the API to get the authorization request URI and then ask the browser to redirect
            const data = await this._callProxyApi('POST', '/login/start', null);
            location.href = data.authorization_request_uri;

        } catch (e) {

            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle login responses when we return from the redirect
     */
    public async handleLoginResponse(): Promise<void> {
        
        try {

            const urlData = urlparse(location.href, true);
            if (urlData.query && urlData.query.state) {

                throw new Error('YAY - login response');
            }

        } catch (e) {

            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);
        }

        // If the page loads with a state query parameter we classify it as an OAuth response
        
    }

    /*
     * Do the logout redirect
     */
    public async logout(): Promise<void> {
        throw new Error('logout not implemented');
    }

    /*
     * This method is for testing only, to make the access token receive a 401 response from the API
     */
    public async expireAccessToken(): Promise<void> {
        this._accessToken = `x${this._accessToken}x`;
    }

    /*
     * For testing, make the refresh token act like it is expired, when applicable
     */
    public async expireRefreshToken(): Promise<void> {
        throw new Error('expireRefreshToken not implemented');
    }

    /*
     * Perform an OAuth operation server side in the API
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
            };

            if (requestData) {
                options.data = requestData;
                options.headers['content-type'] = 'application/json';
            }

            const response = await axios.request(options as AxiosRequestConfig);
            return response.data;

        } catch (e) {

            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }
}
