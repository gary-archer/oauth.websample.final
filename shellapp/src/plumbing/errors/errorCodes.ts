/*
 * Error codes that the UI can program against
 */
export class ErrorCodes {

    // A technical error starting a login request via the Token Handler API
    public static readonly loginRequestFailed = 'login_request_failed';

    // A technical error processing the login response and calling the Token Handler API
    public static readonly loginResponseFailed = 'login_response_failed';

    // An error returned when the  generic 401 error returned to clients who send incorrect data
    public static readonly sessionExpiredError = 'session_expired';

    // An error starting a logout request
    public static readonly logoutRequestFailed = 'logout_request_failed';

    // A general exception in the UI
    public static readonly generalUIError = 'ui_error';

    // An error making an HTTP call
    public static readonly networkError = 'network_error';

    // An error receiving data as JSON
    public static readonly jsonDataError = 'json_data_error';

    // A general error response from the API
    public static readonly responseError = 'http_response_error';
}
