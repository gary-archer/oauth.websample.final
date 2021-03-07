import {ApiError} from './apiError';
import {ClientError} from './clientError';
import {ErrorCodes} from './errorCodes';
import {ApiLogger} from '../utilities/apiLogger';

/*
 * A class to handle composing and reporting errors
 */
export class ErrorHandler {

    /*
     * Handle the server error and get client details
     */
    public static handleError(exception: any): ClientError {

        // Ensure that the exception has a known type
        const handledError = ErrorHandler.fromException(exception);
        if (exception instanceof ClientError) {

            // Client errors mean the caller did something wrong
            const clientError = handledError as ClientError;

            // Log the error
            const errorToLog = clientError.toLogFormat();
            ApiLogger.error(JSON.stringify(errorToLog, null, 2));

            // Return the API response to the caller
            return clientError;

        } else {

            // API errors mean we experienced a failure
            const apiError = handledError as ApiError;

            // Log the error with an id
            const errorToLog = apiError.toLogFormat();
            ApiLogger.error(JSON.stringify(errorToLog, null, 2));

            // Return the API response to the caller
            return apiError.toClientError();
        }
    }

    /*
     * Ensure that all errors are of a known type
     */
    public static fromException(exception: any): ApiError | ClientError {

        // Already handled 500 errors
        if (exception instanceof ApiError) {
            return exception;
        }

        // Already handled 4xx errors
        if (exception instanceof ClientError) {
            return exception;
        }

        // Handle general exceptions
        const apiError = new ApiError(
            ErrorCodes.serverError,
            'An unexpected exception occurred in the API',
            exception.stack);

        apiError.details = this._getExceptionDetails(exception);
        return apiError;
    }

    /*
     * Handle requests to API routes that don't exist
     */
    public static fromRequestNotFound(context?: string): ClientError {

        const error = new ClientError(
            404,
            ErrorCodes.requestNotFound,
            context ?? 'A request was sent to a route that does not exist');
        error.logContext = context!;
        return error;
    }

    /*
     * Handle failed HTTP connectivity
     */
    public static fromHttpRequestError(exception: any, url: string): ApiError {

        const apiError = new ApiError(
            ErrorCodes.httpRequestError,
            'Unable to connect to the Authorization Server',
            exception.stack);

        apiError.url = url;
        apiError.details = this._getExceptionDetails(exception);
        return apiError;
    }

    /*
     * These can occur in normal usage when a cookie expires or a new browser session is started
     * We return the standard invalid_grant error code which our SPA checks for
     */
    public static fromMissingCookieError(logContext: string): ClientError {

        const error = new ClientError(
            400,
            ErrorCodes.invalidGrant,
            'A required cookie was missing from a token request');

        error.logContext = logContext;
        return error;
    }

    /*
     * Other security failures such as invalid CSRF requests
     */
    public static fromSecurityVerificationError(logContext: string): ClientError {

        const error = new ClientError(
            400,
            ErrorCodes.securityVerificationFailed,
            'The request failed security verification');

        error.logContext = logContext;
        return error;
    }

    /*
     * Handle failed cookie decryption
     */
    public static fromCookieDecryptionError(name: string, exception: any): ApiError {

        const apiError = new ApiError(
            ErrorCodes.securityVerificationFailed,
            'A cookie supplied in a token request failed decryption',
            exception.stack);

        apiError.statusCode = 400;
        apiError.details = `Name: ${name}, Details: ${this._getExceptionDetails(exception)}`;
        return apiError;
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static _getExceptionDetails(e: any): string {

        if (e.message) {
            return e.message;
        } else {
            const details = e.toString();
            if (details !== {}.toString()) {
                return details;
            } else {
                return '';
            }
        }
    }
}
