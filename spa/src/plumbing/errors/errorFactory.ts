import {ErrorCodes} from './errorCodes';
import {UIError} from './uiError';

/*
 * Handle errors specific to this app
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
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
        return error;
    }

    /*
     * Exceptions during fetches could be caused by CORS misconfiguration, server unavailable or JSON parsing failures
     */
    public static getFromFetchError(exception: any, url: string, source: string): UIError {

        // Already handled
        if (exception instanceof UIError) {
            return exception;
        }

        let error: UIError;
        if (exception.constructor.name === 'SyntaxError') {

            // Handle JSON parse errors
            error = new UIError(
                'Data',
                ErrorCodes.dataError,
                `Unexpected data received from the ${source}`);

        } else {

            // Handle connection or CORS errors
            error = new UIError(
                'Connection',
                ErrorCodes.connectionError,
                `A connection error occurred when the UI called the ${source}`,
                exception.stack);
        }

        error.setDetails(this.getExceptionMessage(exception));
        error.setUrl(url);
        return error;
    }

    /*
     * Handle fetch response errors
     */
    public static async getFromFetchResponseError(response: Response, source: string): Promise<UIError> {

        const error = new UIError(
            source,
            ErrorCodes.responseError,
            `An error response was returned from the ${source}`
        );

        error.setStatusCode(response.status);
        return error;
    }

    /*
     * Response errors can contain JSON error details or may be non-JSON responses from an API gateway
     */
    public static async getFromApiResponseError(response: Response, source: string): Promise<UIError> {

        const error = await this.getFromFetchResponseError(response, source);

        try {
            const apiError = await response.json();
            if (apiError) {

                // All API endpoints return JSON errors with code and message fields
                if (apiError.code && apiError.message) {
                    error.setErrorCode(apiError.code);
                    error.setDetails(apiError.message);
                }

                // Set extra details returned for API 5xx errors
                if (apiError.area && apiError.id && apiError.utcTime) {
                    error.setApiErrorDetails(apiError.area, apiError.id, apiError.utcTime);
                }
            }
        } catch {
            // Swallow JSON parse errors for unexpected responses
        }

        return error;
    }

    /*
     * Return an error due to rendering the view
     */
    public static fromRenderError(exception: any, componentStack: string): UIError {

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
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
        if (componentStack) {
            error.setDetails(`${error.getDetails()} : ${componentStack}`);
        }

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
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
        return error;
    }

    /*
     * Handle any invalid login responses from the OAuth agent, to prevent redirect loops
     */
    public static fromInvalidLoginResponse(): UIError {

        return new UIError(
            'Login',
            ErrorCodes.loginResponseFailed,
            'An unexpected login response was received');
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
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
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
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
        return error;
    }

    /*
     * Handle errors expiring tokens in cookies for test purposes
     */
    public static fromTestExpiryError(exception: any, type: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create and return the error
        return new UIError(
            'Expiry',
            ErrorCodes.expiryTestError,
            `A technical problem occurred during expiry testing of the ${type} token`,
            exception.stack);
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static getExceptionMessage(exception: any): string {

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
