import axios, {AxiosRequestConfig, Method} from 'axios';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorHandler} from '../../errors/errorHandler';
import {ErrorConsoleReporter} from '../../errors/errorConsoleReporter';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';

/*
 * A helper class to deal with aspects related to our secure cookie
 */
export class SecureCookieHelper {

    private readonly _configuration: OAuthConfiguration;
    private readonly _responseBodyFieldName = 'csrf_field';
    private readonly _requestHeaderFieldName = 'x-mycompany-finalspa-refresh-csrf';

    public constructor(configuration: OAuthConfiguration) {
        this._configuration = configuration;
    }

    /*
     * Override the prototype to add an extra CSRF header when needed, to help protect our secure cookie
     */
    public initialise() {

        // tslint:disable:no-this-assignment
        const that = this;
        const orig = XMLHttpRequest.prototype.open as any;
        XMLHttpRequest.prototype.open = function (method: string, url: string) {
            orig.call(this, method, url);
            that._addCsrfFieldToRequestHeader(this, url);
        };

        // Then freeze the prototype so that malicious code is unable to intercept the bearer header
        Object.freeze(XMLHttpRequest.prototype);
    }

    /*
     * Store the CSRF field when the web reverse proxy returns it in the Authorization Code Grant response
     */
    public setCsrfFieldFromResponse(response: any) {

        if (response[this._responseBodyFieldName]) {
            HtmlStorageHelper.tokenEndpointCookieCsrfField = response[this._responseBodyFieldName];
        }
    }

    /*
     * Clean up cookie related resources when the user session ends
     */
    public async clearRefreshToken(): Promise<void> {

        // Send a delete request to the reverse proxy's token endpoint to clear resources for secure cookies
        await this._sendCookieRequest('DELETE', 'token');

        // Also remove the CSRF field from local storage
        HtmlStorageHelper.removeTokenEndpointCookieCsrfField();
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

        const url = `${this._configuration.reverseProxyUrl}/${operationPath}`;
        try {

            // Send our request form URL encoded, as for other requests to the reverse proxy
            const formData = new URLSearchParams();
            formData.append('client_id', this._configuration.clientId);

            // Define request options
            const options = {
                url,
                method,
                data: formData,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
            };

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
    private _addCsrfFieldToRequestHeader(request: XMLHttpRequest, url: string) {

        if (url.toLowerCase().startsWith(this._configuration.reverseProxyUrl)) {

            const value = HtmlStorageHelper.tokenEndpointCookieCsrfField;
            if (value) {
                request.setRequestHeader(this._requestHeaderFieldName, value);
            }
        }
    }
}
