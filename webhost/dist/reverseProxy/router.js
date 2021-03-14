"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const errorHandler_1 = require("./errors/errorHandler");
const responseWriter_1 = require("./utilities/responseWriter");
const authService_1 = require("./services/authService");
/*
 * A class to route incoming requests to the auth service, and to handle error responses
 */
class Router {
    constructor(configuration) {
        this._authService = new authService_1.AuthService(configuration);
        this._setupCallbacks();
    }
    /*
     * The entry point for requests to the token endpoint
     */
    async tokenEndpoint(request, response) {
        if (request.body && request.body.grant_type) {
            // Route the request to the Authorization Server, then store the refresh token in a cookie
            if (request.body.grant_type === 'authorization_code') {
                await this._authService.authorizationCodeGrant(request, response);
                return;
            }
            // Read the refresh token, then attach it to the request to the Authorization Server
            if (request.body.grant_type === 'refresh_token') {
                await this._authService.refreshTokenGrant(request, response);
                return;
            }
        }
        // Other grants are not supported
        throw errorHandler_1.ErrorHandler.fromRequestNotFound('A token endpoint request was received without a valid grant type');
    }
    /*
     * Clear cookies when the user session ends
     */
    async clearCookies(request, response) {
        await this._authService.clearCookies(request, response);
    }
    /*
     * Do the work of making a refresh token act expired
     */
    async expireRefreshToken(request, response) {
        await this._authService.expireRefreshToken(request, response);
    }
    /*
     * Handle requests to routes that do not exist
     */
    notFoundHandler(request, response) {
        // Handle the error to ensure it is logged
        const clientError = errorHandler_1.ErrorHandler.fromRequestNotFound();
        errorHandler_1.ErrorHandler.handleError(clientError);
        // Return an error to the client
        responseWriter_1.ResponseWriter.writeObjectResponse(response, clientError.statusCode, clientError.toResponseFormat());
    }
    /*
     * The entry point for handling exceptions forwards all exceptions to our handler class
     */
    unhandledExceptionHandler(unhandledException, request, response) {
        // Handle the error to ensure it is logged
        const clientError = errorHandler_1.ErrorHandler.handleError(unhandledException);
        // Return an error to the client
        responseWriter_1.ResponseWriter.writeObjectResponse(response, clientError.statusCode, clientError.toResponseFormat());
    }
    /*
     * Set up async callbacks
     */
    _setupCallbacks() {
        this.tokenEndpoint = this.tokenEndpoint.bind(this);
        this.expireRefreshToken = this.expireRefreshToken.bind(this);
        this.clearCookies = this.clearCookies.bind(this);
        this.notFoundHandler = this.notFoundHandler.bind(this);
        this.unhandledExceptionHandler = this.unhandledExceptionHandler.bind(this);
    }
}
exports.Router = Router;
