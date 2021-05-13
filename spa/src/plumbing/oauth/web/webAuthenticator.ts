import axios, {AxiosRequestConfig, Method} from 'axios';
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
     * Trigger the login redirect
     */
    public async login(): Promise<void> {

        const data = await this._callProxyApi('POST', 'spa/login/start', null);
        location.href = data.authorization_request_uri;
    }

    /*
     * Handle login responses on the main window
     */
    public async handleLoginResponse(): Promise<void> {
        throw new Error('handleLoginResponse not implemented');
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
