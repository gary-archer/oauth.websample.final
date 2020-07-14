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
            ApiLogger.error(JSON.stringify(errorToLog, null, '  '));

            // Return the API response to the caller
            return clientError;

        } else {

            // API errors mean we experienced a failure
            const apiError = handledError as ApiError;

            // Log the error with an id
            const errorToLog = apiError.toLogFormat();
            ApiLogger.error(JSON.stringify(errorToLog, null, '  '));

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
    public static fromRequestNotFound(): ClientError {

        return new ClientError(
            404,
            ErrorCodes.requestNotFound,
            'A request was sent to a route that does not exist');
    }

    /*
     * Handle failed HTTP connectivity
     */
    public static fromRequestError(exception: any): ApiError {

        const apiError = new ApiError(
            ErrorCodes.httpRequestError,
            'Unable to connect to the Authorization Server',
            exception.stack);

        apiError.details = this._getExceptionDetails(exception);
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
