import {UIError} from './uiError';

/*
 * A class to handle error processing
 */
export class ErrorHandler {

    /*
     * Return an error based on the exception type or properties
     */
    public static getFromException(e: any): UIError {

        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }

        // Create the error
        const error = new UIError(
            'UI',
            'general_exception',
            'A technical problem was encountered in the UI');

        // Set technical details from the received exception
        error.details = ErrorHandler._getExceptionMessage(e);

        // Include the stack trace of the received exception
        if (e.stack) {
            error.addToStackFrames(e.stack);
        }

        return error;
    }

    /*
     * A login required error is thrown to short circuit execution when the UI cannot get an access token
     */
    public static getFromLoginRequired(): UIError {

        return new UIError(
            'login',
            'login_required',
            'No access token is available and a login is required');
    }

    /*
     * Sign in request errors most commonly mean a CORS error or that the API is unavailable
     */
    public static getFromOAuthRequest(e: any, errorCode: string): UIError {

        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }

        // Create the error
        const error = new UIError(
            'Login',
            errorCode,
            `A technical problem occurred during login processing`);

        // Set technical details from the received exception
        error.details = ErrorHandler._getOAuthExceptionMessage(e);

        // Set the stack location within the OIDC library
        if (e.stack) {
            error.addToStackFrames(e.stack);
        }

        return error;
    }

    /*
     * Sign in response errors most commonly have OAuth error details
     */
    public static getFromOAuthResponse(e: any, errorCode: string): UIError {

        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }

        // Create the error
        const error = new UIError(
            'Login',
            errorCode,
            `A technical problem occurred during login processing`);

        // Set technical details from the received exception
        error.details = ErrorHandler._getOAuthExceptionMessage(e);

        // Set the stack location within the OIDC library
        if (e.stack) {
            error.addToStackFrames(e.stack);
        }

        return error;
    }

    /*
     * Return an object for Ajax errors
     */
    public static getFromApiError(xhr: any, url: string): UIError {

        // Already handled errors
        if (xhr instanceof UIError) {
            return xhr;
        }

        let error = null;
        if (xhr.status === 0 ) {

            // This status is generally a CORS or availability problem
            error = new UIError(
                'Network',
                'api_uncontactable',
                'A network problem occurred when the UI called the server');
            error.details = 'API not available or request was not allowed';

        } else if (xhr.status >= 200 && xhr.status <= 299) {

            // This status is generally a JSON parsing error
            error = new UIError(
                'Data',
                'api_data_error',
                'A technical problem occurred when the UI received data');
            error.details = 'Unable to parse data from API response';

        } else {

            // Create a default API error
            error = new UIError(
                'API',
                'general_api_error',
                'A technical problem occurred when the UI called the server');
            error.details = 'API returned an error response';

            // Override the default  we should have a server response in most cases
            ErrorHandler._updateFromApiErrorResponse(error, xhr);
        }

        error.statusCode = xhr.status;
        error.url = url;
        return error;
    }

    /*
     * Try to update the default API error with response details
     */
    private static _updateFromApiErrorResponse(error: UIError, xhr: any): void {

        // Attempt to read the API error response
        const apiError = ErrorHandler._readApiJsonResponse(xhr);
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
     * If the API response is JSON then attempt to parse it into an object
     */
    private static _readApiJsonResponse(xhr: any): any {

        try {
            // We have to assume that the response is JSON
            // We cannot read headers content-length and content-type to verify this
            return JSON.parse(xhr.responseText);

        } catch (e) {
            console.log(`Malformed JSON received in an API response: ${e}`);
        }
    }

    /*
     * Get the message from an OAuth exception
     */
    private static _getOAuthExceptionMessage(e: any): string {

        let oauthError = '';
        if (e.error) {
            oauthError = e.error;
            if (e.error_description) {
                oauthError += ` : ${e.error_description}`;
            }
        }

        if (oauthError) {
            return oauthError;
        } else {
            return ErrorHandler._getExceptionMessage(e);
        }
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static _getExceptionMessage(e: any): string {

        if (e.message) {
            return e.message;
        } else {
            const details = e.toString();
            if (details !== {}.toString()) {
                return details;
            } else {
                return 'Unable to read error details from exception';
            }
        }
    }
}
