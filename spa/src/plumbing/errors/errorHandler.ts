import {ErrorCodes} from './errorCodes';
import {UIError} from './uiError';

/*
 * A class to handle error processing
 */
export class ErrorHandler {

    /*
     * Return an error based on the exception type or properties
     */
    public static getFromException(exception: any): UIError {

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
        error.details = ErrorHandler._getExceptionMessage(exception);
        return error;
    }

    /*
     * A login required error is thrown to short circuit execution when the UI cannot get an access token
     */
    public static getFromLoginRequired(): UIError {

        return new UIError(
            'Login',
            ErrorCodes.loginRequired,
            'No access token is available and a login is required');
    }

    /*
     * Sign in request errors most commonly mean a CORS error or that the API is unavailable
     */
    public static getFromOAuthRequest(exception: any, errorCode: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Login',
            errorCode,
            `A technical problem occurred during login processing`,
            exception.stack);

        // Set technical details from the received exception
        error.details = ErrorHandler._getOAuthExceptionMessage(exception);
        return error;
    }

    /*
     * Sign in response errors most commonly have OAuth error details
     */
    public static getFromOAuthResponse(exception: any, errorCode: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Login',
            errorCode,
            `A technical problem occurred during login processing`,
            exception.stack);

        // Set technical details from the received exception
        error.details = ErrorHandler._getOAuthExceptionMessage(exception);
        return error;
    }

    /*
     * Return an object for Ajax errors
     */
    public static getFromWebDownloadError(exception: any, url: string): UIError {

        // Calculate the status code
        let statusCode = 0;
        if (exception.response && exception.response.status) {
            statusCode = exception.response.status;
        }

        let error: UIError;
        if (statusCode >= 200 && statusCode <= 299) {

            // This status is generally a JSON parsing error
            error = new UIError(
                'Data',
                ErrorCodes.webDataError,
                'A technical problem occurred parsing web server data',
                exception.stack);
            error.details = this._getExceptionMessage(exception);

        } else {

            // Otherwise there is some kind of network or not found error
            error = new UIError(
                'Network',
                ErrorCodes.webAjaxError,
                'A problem occurred when the UI called the web server',
                exception.stack);
            error.details = this._getExceptionMessage(exception);
        }

        error.statusCode = statusCode;
        error.url = url;
        return error;
    }

    /*
     * Return an object for Ajax errors
     */
    public static getFromApiError(exception: any, url: string): UIError {

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
        if (statusCode === 0 ) {

            // This status is generally a CORS or availability problem
            error = new UIError(
                'Network',
                ErrorCodes.apiNetworkError,
                'A network problem occurred when the UI called the server',
                exception.stack);
            error.details = this._getExceptionMessage(exception);

        } else if (statusCode >= 200 && statusCode <= 299) {

            // This status is generally a JSON parsing error
            error = new UIError(
                'Data',
                ErrorCodes.apiDataError,
                'A technical problem occurred when the UI received data',
                exception.stack);
            error.details = this._getExceptionMessage(exception);

        } else {

            // Create a default API error
            error = new UIError(
                'API',
                ErrorCodes.apiResponseError,
                'A technical problem occurred when the UI called the server',
                exception.stack);
            error.details = this._getExceptionMessage(exception);

            // Override the default with a server response when received and CORS allows us to read it
            if (exception.response && exception.response.data && typeof exception.response.data === 'object') {
                ErrorHandler._updateFromApiErrorResponse(error, exception.response.data);
            }
        }

        error.statusCode = statusCode;
        error.url = url;
        return error;
    }

    /*
     * Return an error due to rendering the view
     */
    public static getFromRenderError(exception: any, componentStack?: string): UIError {

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
        error.details = ErrorHandler._getExceptionMessage(exception);
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
     * Get the message from an OAuth exception
     */
    private static _getOAuthExceptionMessage(exception: any): string {

        let oauthError = '';
        if (exception.error) {
            oauthError = exception.error;
            if (exception.error_description) {
                oauthError += ` : ${exception.error_description}`;
            }
        }

        if (oauthError) {
            return oauthError;
        } else {
            return ErrorHandler._getExceptionMessage(exception);
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
