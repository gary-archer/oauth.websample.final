import {BaseErrorCodes} from './baseErrorCodes';
import {UIError} from './uiError';

/*
 * Base error creation
 */
export class BaseErrorFactory {

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
            BaseErrorCodes.generalUIError,
            'A technical problem was encountered in the UI',
            exception.stack);

        // Set technical details from the received exception
        error.details = BaseErrorFactory.getExceptionMessage(exception);
        return error;
    }

    /*
     * Return an object for Ajax errors
     */
    public static fromJsonParseError(): UIError {

        return new UIError(
            'Data',
            BaseErrorCodes.jsonDataError,
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

        let error: UIError;
        if (statusCode === 0) {

            // This status is generally a CORS or availability problem
            error = new UIError(
                'Network',
                BaseErrorCodes.networkError,
                `A network problem occurred when the UI called the ${source}`,
                exception.stack);
            error.details = BaseErrorFactory.getExceptionMessage(exception);

        } else if (statusCode >= 200 && statusCode <= 299) {

            // This status is generally a JSON parsing error
            error = new UIError(
                'JSON',
                BaseErrorCodes.jsonDataError,
                `'A technical problem occurred parsing data from the ${source}`,
                exception.stack);
            error.details = BaseErrorFactory.getExceptionMessage(exception);

        } else {

            // Create an error indicating a data problem
            error = new UIError(
                source,
                BaseErrorCodes.responseError,
                `An error response was returned from the ${source}`,
                exception.stack);
            error.details = BaseErrorFactory.getExceptionMessage(exception);

            // Override the default with a server response when received and CORS allows us to read it
            if (exception.response && exception.response.data && typeof exception.response.data === 'object') {
                BaseErrorFactory._updateFromApiErrorResponse(error, exception.response.data);
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
            BaseErrorCodes.renderError,
            'A technical problem was encountered rendering the UI',
            exception.stack);

        // Set technical details from the received exception
        error.details = BaseErrorFactory.getExceptionMessage(exception);
        if (componentStack) {
            error.details += ` : ${componentStack}`;
        }

        return error;
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    public static getExceptionMessage(exception: any): string {

        if (exception.message) {
            return exception.message;
        }

        const details = exception.toString();
        if (details !== {}.toString()) {
            return details;
        }

        return '';
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
}
