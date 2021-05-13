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
            console.log('*** LOGIN START');

            // Try to call the API to get the authorization request URI and then ask the browser to redirect
            const response = await this._callProxyApi('POST', '/login/start', null);
            location.href = response.authorization_request_uri;

        } catch (e) {

            // Handle errors returned from the API
            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle login responses when we return from the redirect
     */
    public async handleLoginResponse(): Promise<void> {

        // If the page loads with OAuth query parameters, process them as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state && urlData.query.code) {

            let redirectLocation = '#';
            try {

                // Send the code and state to the proxy API to complete the login
                const request = {
                    code: urlData.query.code,
                    state: urlData.query.state,
                };
                const response = await this._callProxyApi('POST', '/login/end', request);

                console.log('YAY = got response');
                console.log(response);

                
            } catch (e) {

                // Handle errors returned from the API
                throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);

            } finally {

                // Always replace the browser location, to remove OAuth details from back navigation
                history.replaceState({}, document.title, redirectLocation);
            }
        }

        // Also handle OAuth error responses from the Authorization Server, eg if we send an invalid scope
        if (urlData.query && urlData.query.state && urlData.query.error) {
        
            const errorCode = urlData.query.error;
            const errorDescription = urlData.query.error_description ?? 'Problem encountered in a login response';
            console.log(`Code: ${errorCode}, Description: ${errorDescription}`);
        }
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
     * For testing, call the API to make the refresh token act like it is expired
     */
    public async expireRefreshToken(): Promise<void> {
        throw new Error('expireRefreshToken not implemented');
    }

    /*
     * Call the OAuth Proxy API to perform an OAuth operation, and send cookie credentials
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

            const response = await axios.request(options as AxiosRequestConfig);
            return response.data;

        } catch (e) {

            throw ErrorHandler.getFromHttpError(e, url, 'OAuth Proxy API');
        }
    }
}
