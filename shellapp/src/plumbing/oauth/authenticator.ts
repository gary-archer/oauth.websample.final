import axios, {AxiosRequestConfig, Method} from 'axios';
import {Guid} from 'guid-typescript';
import {Configuration} from '../../configuration/configuration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorFactory} from '../errors/errorFactory';
import {UIError} from '../errors/uiError';
import {AxiosUtils} from '../utilities/axiosUtils';
import {HtmlStorageHelper} from '../utilities/htmlStorageHelper';
import {PageLoadResult} from './pageLoadResult';

/*
 * A class to interact with the OAuth agent to perform API driven login and logout
 */
export class Authenticator {

    private readonly _configuration: Configuration;
    private readonly _sessionId: string;

    public constructor(configuration: Configuration, sessionId: string) {
        this._configuration = configuration;
        this._sessionId = sessionId;
        this._setupCallbacks();
    }

    /*
     * Get the authenticated state, or handle an OpenID Connect authorization response
     */
    public async handlePageLoad(): Promise<PageLoadResult> {

        try {

            // Get the authentication state from the OAuth agent
            const request = {
                url: location.href,
            };
            const pageLoadResult = await this._callOAuthAgent(
                'POST',
                'login/end',
                request) as PageLoadResult;

            // Store the anti forgery token, where it can be picked up by the target micro UI
            if (pageLoadResult.antiForgeryToken) {
                HtmlStorageHelper.antiForgeryToken = pageLoadResult.antiForgeryToken;
            }

            // If a login response was handled, return to the micro-UI that triggered the login
            if (pageLoadResult.handled) {

                HtmlStorageHelper.loggedOut = false;
                const appBasePath = HtmlStorageHelper.postLoginRestore() || this._configuration.defaultAppBasePath;
                location.href = `${location.origin}${appBasePath}callback`;
            }

            // Return the authenticated state to the rest of the app
            return pageLoadResult;

        } catch (e: any) {

            // Session expired errors mean re-authentication is required
            if (this._isSessionExpiredError(e)) {

                HtmlStorageHelper.clearAntiForgeryToken();
                return {
                    isLoggedIn: false,
                    handled: false,
                };
            }

            // Rethrow other errors
            throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginResponseFailed);
        }
    }

    /*
     * Trigger the login redirect to the authorization server
     */
    public async login(): Promise<void> {

        try {

            const response = await this._callOAuthAgent('POST', 'login/start', null);
            location.href = response.authorizationRequestUri;

        } catch (e: any) {

            throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Trigger the logout redirect to the authorization server
     */

    public async logout(): Promise<void> {

        try {

            if (HtmlStorageHelper.antiForgeryToken) {

                const response = await this._callOAuthAgent('POST', 'logout', null);
                HtmlStorageHelper.loggedOut = true;
                location.href = response.endSessionRequestUri;
            }

        } catch (e: any) {

            throw ErrorFactory.fromLogoutOperation(e, ErrorCodes.logoutRequestFailed);

        } finally {

            HtmlStorageHelper.clearAntiForgeryToken();
        }
    }

    /*
     * A parameterized method for calling the OAuth agent
     */
    private async _callOAuthAgent(method: Method, operationPath: string, requestData: any): Promise<any> {

        const url = `${this._configuration.oauthAgentBaseUrl}/${operationPath}`;
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

        } catch (e: any) {

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

            (options.headers as any)['x-mycompany-csrf'] = HtmlStorageHelper.antiForgeryToken;
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
     * Plumbing to ensure that the this parameter is available in callbacks
     */
    private _setupCallbacks(): void {
        this.login = this.login.bind(this);
    }
}
