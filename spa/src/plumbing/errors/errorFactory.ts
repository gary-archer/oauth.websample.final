import {ErrorCodes} from './errorCodes';
import {UIError} from './uiError';

/*
 * A class to handle error processing
 */
export class ErrorFactory {

    /*
     * Return an error based on the exception type or properties
     */
    public static fromException(exception: any): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Web UI',
            ErrorCodes.generalUIError,
            'A technical problem was encountered in the UI',
            exception.stack);

        // Set technical details from the received exception
        error.details = ErrorFactory._getExceptionMessage(exception);
        return error;
    }

    /*
     * A login required error is thrown to short circuit execution when the UI cannot get an access token
     */
    public static fromLoginRequired(): UIError {

        return new UIError(
            'Login',
            ErrorCodes.loginRequired,
            'No access token is available and a login is required');
    }

    /*
     * Handle errors signing in
     */
    public static fromLoginOperation(exception: any, errorCode: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Login',
            errorCode,
            'A technical problem occurred during login processing',
            exception.stack);

        // Set technical details from the received exception
        error.details = ErrorFactory._getExceptionMessage(exception);
        return error;
    }

    /*
     * Handle errors during token operations
     */
    public static fromTokenRefreshError(exception: any): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Token',
            ErrorCodes.tokenRefreshError,
            'A technical problem occurred during a token refresh operation',
            exception.stack);

        // Set technical details from the received exception
        error.details = ErrorFactory._getExceptionMessage(exception);
        return error;
    }

    /*
     * Handle sign out request errors
     */
    public static fromLogoutOperation(exception: any, errorCode: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Logout',
            errorCode,
            'A technical problem occurred during logout processing',
            exception.stack);

        // Set technical details from the received exception
        error.details = ErrorFactory._getExceptionMessage(exception);
        return error;
    }

    /*
     * Handle errors expiring tokens in cookies for test purposes
     */
    public static fromExpiryText(exception: any, type: string): UIError {

        return new UIError(
            'Expiry',
            ErrorCodes.expiryTestError,
            `A technical problem occurred during expiry testing of the ${type} token`,
            exception.stack);

    }

    /*
     * Return an object for Ajax errors
     */
    public static fromJsonParseError(): UIError {

        return new UIError(
            'Data',
            ErrorCodes.jsonDataError,
            'HTTP response data was not valid JSON and could not be parsed');
    }

    /*
     * Return an object for Ajax errors
     */
    public static fromHttpError(exception: any, url: string, source: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Calculate the status code
        let statusCode = 0;
        if (exception.response && exception.response.status) {
            statusCode = exception.response.status;
        }

        let error = null;
        if (statusCode === 0) {

            // This status is generally a CORS or availability problem
            error = new UIError(
                'Network',
                ErrorCodes.networkError,
                `A network problem occurred when the UI called the ${source}`,
                exception.stack);
            error.details = this._getExceptionMessage(exception);

        } else if (statusCode >= 200 && statusCode <= 299) {

            // This status is generally a JSON parsing error
            error = new UIError(
                'JSON',
                ErrorCodes.jsonDataError,
                `'A technical problem occurred parsing data from the ${source}`,
                exception.stack);
            error.details = this._getExceptionMessage(exception);

        } else {

            // Create an error indicating a data problem
            error = new UIError(
                source,
                ErrorCodes.responseError,
                `An error response was returned from the ${source}`,
                exception.stack);
            error.details = this._getExceptionMessage(exception);

            // Override the default with a server response when received and CORS allows us to read it
            if (exception.response && exception.response.data && typeof exception.response.data === 'object') {
                ErrorFactory._updateFromApiErrorResponse(error, exception.response.data);
            }
        }

        error.statusCode = statusCode;
        error.url = url;
        return error;
    }

    /*
     * Return an error due to rendering the view
     */
    public static fromRenderError(exception: any, componentStack?: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Web UI',
            ErrorCodes.renderError,
            'A technical problem was encountered rendering the UI',
            exception.stack);

        // Set technical details from the received exception
        error.details = ErrorFactory._getExceptionMessage(exception);
        if (componentStack) {
            error.details += ` : ${componentStack}`;
        }

        return error;
    }

    /*
     * Try to update the default API error with response details
     */
    private static _updateFromApiErrorResponse(error: UIError, apiError: any): void {

        // Attempt to read the API error response
        if (apiError) {

            // Set the code and message, returned for both 4xx and 5xx errors
            if (apiError.code && apiError.message) {
                error.errorCode = apiError.code;
                error.details = apiError.message;
            }

            // Set extra details returned for 5xx errors
            if (apiError.area && apiError.id && apiError.utcTime) {
                error.setApiErrorDetails(apiError.area, apiError.id, apiError.utcTime);
            }
        }
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static _getExceptionMessage(exception: any): string {

        if (exception.message) {
            return exception.message;
        }

        const details = exception.toString();
        if (details !== {}.toString()) {
            return details;
        }

        return '';
    }
}
