/*
 * Error codes that the UI can program against
 */
export class ErrorCodes {

    // A technical error starting a login request via the Token Handler API
    public static readonly loginRequestFailed = 'login_request_failed';

    // A technical error processing the login response and calling the Token Handler API
    public static readonly loginResponseFailed = 'login_response_failed';

    // An error starting a logout request
    public static readonly logoutRequestFailed = 'logout_request_failed';
}
