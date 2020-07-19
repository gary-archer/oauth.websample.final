import axios, {AxiosRequestConfig, Method} from 'axios';
import {ErrorHandler} from '../../errors/errorHandler';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorConsoleReporter} from '../../errors/errorConsoleReporter';

/*
 * A helper class to deal with aspects related to our secure cookie
 */
export class SecureCookieHelper {

    private readonly _configuration: OAuthConfiguration;
    private readonly _localStorageKeyName = 'finalspa.cookie.csrf';
    private readonly _responseBodyFieldName = 'csrf_field';
    private readonly _requestHeaderFieldName = 'x-mycompany-finalspa-refresh-csrf';

    public constructor(configuration: OAuthConfiguration) {
        this._configuration = configuration;
    }

    /*
     * Initialise calls to our web reverse proxy
     */
    public initialise() {

        // Override the prototype to add an extra header in some cases
        // tslint:disable:no-this-assignment
        const that = this;
        const orig = XMLHttpRequest.prototype.open as any;
        XMLHttpRequest.prototype.open = function (method: string, url: string) {
            orig.call(this, method, url);
            that._addCsrfFieldToOidcClientRequestHeader(this, method, url);
        };

        // Then freeze it so that malicious code is unable to intercept the bearer header
        Object.freeze(XMLHttpRequest.prototype);
    }

    /*
     * Store the CSRF field when the web reverse proxy returns it in the Authorization Code Grant response
     */
    public readCsrfFieldFromResponse(response: any) {

        if (response.csrf_field) {
            localStorage.setItem(this._localStorageKeyName, response[this._responseBodyFieldName]);
        }
    }

    /*
     * Clean up cookie related resources when the user session ends
     */
    public async clearRefreshToken(): Promise<void> {

        // Send a delete request to the reverse proxy's token endpoint to clear resources for secure cookies
        await this._sendCookieRequest('DELETE', 'token');

        // Remove the CSRF value once finished
        const csrfField = localStorage.getItem(this._localStorageKeyName);
        if (csrfField) {
            localStorage.removeItem(this._localStorageKeyName);
        }
    }

    /*
     * Call the server and ask it to rewrite the refresh token in the auth cookie, to make it act expired
     */
    public async expireRefreshToken(): Promise<void> {

        await this._sendCookieRequest('POST', 'expire');
    }

    /*
     * Do the common work when sending a cookie expiry related request
     */
    private async _sendCookieRequest(method: Method, operationPath: string): Promise<void> {

        // Send our request form URL encoded, as for other requests to the reverse proxy
        const formData = new URLSearchParams();
        formData.append('client_id', this._configuration.clientId);

        // Define request options
        const url = `${this._configuration.reverseProxyUrl}/${operationPath}`;
        const options = {
            url,
            method,
            data: formData,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
        };

        // Add the CSRF header
        this._addCsrfFieldToAxiosRequestHeader(options as AxiosRequestConfig)

        try {
            // Call our reverse proxy
            await axios.request(options as AxiosRequestConfig);

        } catch (e) {

            // Only output errors for this operation to the console
            const error = ErrorHandler.getFromHttpError(e, url, 'cookie_request');
            ErrorConsoleReporter.output(error);
        }
    }

    /*
     * Protect the web reverse proxy's token endpoint from HTML form attacks
     */
    private _addCsrfFieldToOidcClientRequestHeader(request: XMLHttpRequest, method: string, url: string) {

        if (method.toLowerCase() === 'post' && url.toLowerCase().startsWith(this._configuration.reverseProxyUrl)) {

            const value = localStorage.getItem(this._localStorageKeyName);
            if (value) {
                request.setRequestHeader(this._requestHeaderFieldName, value);
            }
        }
    }

    /*
     * Add the CSRF field for calls initiated from this class
     */
    private _addCsrfFieldToAxiosRequestHeader(options: AxiosRequestConfig) {

        const value = localStorage.getItem(this._localStorageKeyName);
        if (value) {
            options.headers[this._requestHeaderFieldName] = value;
        }
    }
}
