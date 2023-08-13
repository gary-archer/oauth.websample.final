import {BaseErrorFactory, UIError} from './lib';
import {ErrorCodes} from './errorCodes';

/*
 * Handle errors specific to this app
 */
export class ErrorFactory {

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
        error.details = BaseErrorFactory.getExceptionMessage(exception);
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
        error.details = BaseErrorFactory.getExceptionMessage(exception);
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
        error.details = BaseErrorFactory.getExceptionMessage(exception);
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
}
