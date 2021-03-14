"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const apiError_1 = require("./apiError");
const clientError_1 = require("./clientError");
const errorCodes_1 = require("./errorCodes");
const logger_1 = require("../utilities/logger");
/*
 * A class to handle composing and reporting errors
 */
class ErrorHandler {
    /*
     * Handle the server error and get client details
     */
    static handleError(exception) {
        // Ensure that the exception has a known type
        const handledError = ErrorHandler.fromException(exception);
        if (exception instanceof clientError_1.ClientError) {
            // Client errors mean the caller did something wrong
            const clientError = handledError;
            // Log the error
            const errorToLog = clientError.toLogFormat();
            logger_1.Logger.error(JSON.stringify(errorToLog, null, 2));
            // Return the API response to the caller
            return clientError;
        }
        else {
            // API errors mean we experienced a failure
            const apiError = handledError;
            // Log the error with an id
            const errorToLog = apiError.toLogFormat();
            logger_1.Logger.error(JSON.stringify(errorToLog, null, 2));
            // Return the API response to the caller
            return apiError.toClientError();
        }
    }
    /*
     * Ensure that all errors are of a known type
     */
    static fromException(exception) {
        // Already handled 500 errors
        if (exception instanceof apiError_1.ApiError) {
            return exception;
        }
        // Already handled 4xx errors
        if (exception instanceof clientError_1.ClientError) {
            return exception;
        }
        // Handle general exceptions
        const apiError = new apiError_1.ApiError(errorCodes_1.ErrorCodes.serverError, 'An unexpected exception occurred in the API', exception.stack);
        apiError.details = this._getExceptionDetails(exception);
        return apiError;
    }
    /*
     * Handle requests to API routes that don't exist
     */
    static fromRequestNotFound(context) {
        const error = new clientError_1.ClientError(404, errorCodes_1.ErrorCodes.requestNotFound, context !== null && context !== void 0 ? context : 'A request was sent to a route that does not exist');
        error.logContext = context;
        return error;
    }
    /*
     * Handle failed HTTP connectivity
     */
    static fromHttpRequestError(exception, url) {
        const apiError = new apiError_1.ApiError(errorCodes_1.ErrorCodes.httpRequestError, 'Unable to connect to the Authorization Server', exception.stack);
        apiError.url = url;
        apiError.details = this._getExceptionDetails(exception);
        return apiError;
    }
    /*
     * These can occur in normal usage when a cookie expires or a new browser session is started
     * We return the standard invalid_grant error code which our SPA checks for
     */
    static fromMissingCookieError(logContext) {
        const error = new clientError_1.ClientError(400, errorCodes_1.ErrorCodes.invalidGrant, 'A required cookie was missing from a token request');
        error.logContext = logContext;
        return error;
    }
    /*
     * Other security failures such as invalid CSRF requests
     */
    static fromSecurityVerificationError(logContext) {
        const error = new clientError_1.ClientError(400, errorCodes_1.ErrorCodes.securityVerificationFailed, 'The request failed security verification');
        error.logContext = logContext;
        return error;
    }
    /*
     * Handle failed cookie decryption
     */
    static fromCookieDecryptionError(name, exception) {
        const apiError = new apiError_1.ApiError(errorCodes_1.ErrorCodes.securityVerificationFailed, 'A cookie supplied in a token request failed decryption', exception.stack);
        apiError.statusCode = 400;
        apiError.details = `Name: ${name}, Details: ${this._getExceptionDetails(exception)}`;
        return apiError;
    }
    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    static _getExceptionDetails(e) {
        if (e.message) {
            return e.message;
        }
        else {
            const details = e.toString();
            if (details !== {}.toString()) {
                return details;
            }
            else {
                return '';
            }
        }
    }
}
exports.ErrorHandler = ErrorHandler;
