"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
const axios_1 = __importDefault(require("axios"));
const url_1 = require("url");
const clientError_1 = require("../errors/clientError");
const errorHandler_1 = require("../errors/errorHandler");
const httpProxy_1 = require("../utilities/httpProxy");
/*
 * The proxy service class will deal with routing requests to the Authorization Server
 */
class ProxyService {
    constructor(tokenEndpoint) {
        this._tokenEndpoint = tokenEndpoint;
    }
    /*
     * Forward the authorization code grant message to the Authorization Server
     */
    async sendAuthorizationCodeGrant(request, response) {
        const formData = new url_1.URLSearchParams();
        for (const field in request.body) {
            if (field && request.body[field]) {
                formData.append(field, request.body[field]);
            }
        }
        return this._postMessage(formData, response);
    }
    /*
     * Forward the refresh token grant message to the Authorization Server
     */
    async sendRefreshTokenGrant(refreshToken, request, response) {
        const formData = new url_1.URLSearchParams();
        for (const field in request.body) {
            if (field && request.body[field]) {
                formData.append(field, request.body[field]);
            }
        }
        if (formData.has('refresh_token')) {
            formData.delete('refresh_token');
        }
        formData.append('refresh_token', refreshToken);
        return this._postMessage(formData, response);
    }
    /*
     * Route a message to the Authorization Server
     */
    async _postMessage(formData, response) {
        // Define request options
        const options = {
            url: this._tokenEndpoint,
            method: 'POST',
            data: formData,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'accept': 'application/json',
            },
            httpsAgent: httpProxy_1.HttpProxy.get(),
        };
        try {
            // Call the Authorization Server
            const authServerResponse = await axios_1.default.request(options);
            // Update the response for the success case and return data
            response.status(authServerResponse.status);
            response.setHeader('content-type', 'application/json');
            return authServerResponse.data;
        }
        catch (e) {
            // Handle errors
            this._reportAuthorizationServerError(e, options.url);
        }
    }
    /*
     * Do the work of collecting OAuth errors
     */
    _reportAuthorizationServerError(e, url) {
        // Handle OAuth error responses if we have data
        if (e.response && e.response.status && e.response.data) {
            // Get error values and note that error / error_description are the standard values
            const errorCode = e.response.data.error;
            const errorDescription = e.response.data.error_description;
            if (errorCode) {
                // Throw the error
                throw new clientError_1.ClientError(e.response.status, errorCode, errorDescription || 'The Authorization Server rejected the request');
            }
        }
        // Handle client connectivity errors
        throw errorHandler_1.ErrorHandler.fromHttpRequestError(e, url);
    }
}
exports.ProxyService = ProxyService;
