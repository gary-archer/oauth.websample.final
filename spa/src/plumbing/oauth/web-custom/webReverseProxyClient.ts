import axios, {AxiosRequestConfig, Method} from 'axios';
import {ErrorHandler} from '../../errors/errorHandler';
import {ErrorConsoleReporter} from '../../errors/errorConsoleReporter';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {UrlHelper} from '../../utilities/urlHelper';

/*
 * A helper class to deal with the web reverse proxy, its auth cookie, and its CSRF field
 */
export class WebReverseProxyClient {

    private readonly _clientId: string;
    private readonly _reverseProxyBaseUrl: string;
    private readonly _responseBodyFieldName = 'csrf_field';
    private readonly _requestHeaderFieldName = 'x-mycompany-finalspa-refresh-csrf';

    public constructor(clientId: string, reverseProxyBaseUrl: string) {
        this._clientId = clientId;
        this._reverseProxyBaseUrl = reverseProxyBaseUrl;
    }

    /*
     * Override the prototype to send a CSRF request header
     * This accompanies the auth cookie issued by the web reverse proxy
     */
    public initialise(): void {

        // Only do this once
        if (Object.isFrozen(XMLHttpRequest.prototype)) {
            return;
        }

        /* eslint-disable @typescript-eslint/no-this-alias */
        const that = this;
        const orig = XMLHttpRequest.prototype.open as any;
        XMLHttpRequest.prototype.open = function (method: string, url: string) {
            orig.call(this, method, url);
            that._sendCsrfFieldToProxy(this, url);
        };

        // Freeze the prototype so that malicious code is unable to intercept the bearer header
        Object.freeze(XMLHttpRequest.prototype);
    }

    /*
     * Store the CSRF field when the web reverse proxy returns it in the Authorization Code Grant response
     */
    public storeCsrfFieldFromProxy(response: any): void {

        if (response[this._responseBodyFieldName]) {
            HtmlStorageHelper.tokenEndpointCookieCsrfField = response[this._responseBodyFieldName];
        }
    }

    /*
     * Clean up web reverse proxy resources when the user session ends
     */
    public async clearRefreshToken(): Promise<void> {

        // Send a delete request to the reverse proxy's token endpoint to clear HTTP only cookies
        await this._sendWebReverseProxyRequest('DELETE', 'token');

        // Also remove the CSRF field from local storage
        HtmlStorageHelper.removeTokenEndpointCookieCsrfField();
    }

    /*
     * Call the server and ask it to rewrite the refresh token in the auth cookie, to make it act expired
     */
    public async expireRefreshToken(): Promise<void> {

        await this._sendWebReverseProxyRequest('POST', 'expire');
    }

    /*
     * Do the common work when sending a request to the web reverse proxy
     */
    private async _sendWebReverseProxyRequest(method: Method, operationPath: string): Promise<void> {

        const url = UrlHelper.append(this._reverseProxyBaseUrl, operationPath);
        try {

            // Use form URL encoded data
            const formData = new URLSearchParams();
            formData.append('client_id', this._clientId);

            // Define request options
            const options = {
                url,
                method,
                data: formData,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
            };

            // Call the web reverse proxy
            await axios.request(options as AxiosRequestConfig);

        } catch (e) {

            // Only output errors for this operation to the console
            const error = ErrorHandler.getFromHttpError(e, url, 'reverse_proxy_request');
            ErrorConsoleReporter.output(error);
        }
    }

    /*
     * Add a CSRF field to make it harder for attackers to send the web reverse proxy's auth cookie
     */
    private _sendCsrfFieldToProxy(request: XMLHttpRequest, url: string) {

        if (url.toLowerCase().startsWith(this._reverseProxyBaseUrl)) {

            const value = HtmlStorageHelper.tokenEndpointCookieCsrfField;
            if (value) {
                request.setRequestHeader(this._requestHeaderFieldName, value);
            }
        }
    }
}
