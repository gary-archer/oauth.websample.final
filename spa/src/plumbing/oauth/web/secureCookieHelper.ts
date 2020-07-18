import axios, {AxiosRequestConfig} from 'axios';
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

        // Override the prototype
        const that = this;
        const orig = XMLHttpRequest.prototype.open as any;
        XMLHttpRequest.prototype.open = function (method: string, url: string) {
            orig.call(this, method, url);
            that.addCsrfFieldToRequestHeader(this, method, url);
        };

        // Then freeze it so that malicious code is unable to do the same
        //Object.freeze(XMLHttpRequest.prototype);
    }
    
    /*
     * Store the field when we receive it in a response
     */
    public readCsrfFieldFromResponse(response: any) {

        if (response.csrf_field) {
            localStorage.setItem(this._localStoragePrefix + this._csrfFieldName, response.csrf_field);
        }
    }

    /*
     * Add the stored field to an outgoing request, in a manner that protects against scripted forms
     */
    public addCsrfFieldToRequestHeader(request: XMLHttpRequest, method: string, url: string) {

        if (method.toLowerCase() === 'post' && url.toLowerCase() === `${this._configuration.reverseProxyUrl}/token`) {
        
            const value = localStorage.getItem(this._localStoragePrefix + this._csrfFieldName);
            if (value) {
                request.setRequestHeader(this._requestHeaderPrefix + this._csrfFieldName, value);
            }
        }
    }

    /*
     * Call the server and ask it to rewrite the refresh token in the auth cookie, to make it act expired
     */
    public async expireRefreshToken(oauthConfiguration: OAuthConfiguration): Promise<void> {

        // Send our request form URL encoded, as for other requests to the reverse proxy
        const formData = new URLSearchParams();
        formData.append('client_id', oauthConfiguration.clientId);

        // Define request options
        const url = `${oauthConfiguration.reverseProxyUrl}/expire`;
        const options = {
            url,
            method: 'POST',
            data: formData,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
        };

        try {
            // Call our reverse proxy
            await axios.request(options as AxiosRequestConfig);

        } catch (e) {

            // Only output errors for this operation to the console
            const error = ErrorHandler.getFromHttpError(e, url, 'expire_refresh_token');
            ErrorConsoleReporter.output(error);
        }
    }
}
