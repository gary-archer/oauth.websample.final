/*
 * Error codes that the UI can program against
 */
export class ErrorCodes {

    // Used to indicate that the API cannot be called until the user logs in
    public static readonly loginRequired = 'login_required';

    // A technical error starting a login request via the OAuth agent API
    public static readonly loginRequestFailed = 'login_request_failed';

    // A technical error in a login response from the OAuth agent API
    public static readonly loginResponseFailed = 'login_response_failed';

    // A technical problem during token refresh
    public static readonly tokenRefreshError = 'token_refresh_error';

    // An error returned when the refresh token stored in an HTTP-only cookie expires
    public static readonly sessionExpiredError = 'session_expired';

    // An error starting a logout request
    public static readonly logoutRequestFailed = 'logout_request_failed';

    // Returned from APIs when an access token is rejected
    public static readonly invalidToken = 'invalid_token';

    // An error when testing token expiry
    public static readonly expiryTestError = 'expiry_test';

    // A general exception in the UI
    public static readonly generalUIError = 'ui_error';

    // An error making an HTTP call
    public static readonly networkError = 'network_error';

    // An error receiving data as JSON
    public static readonly jsonDataError = 'json_data_error';

    // A general error response from the API
    public static readonly responseError = 'http_response_error';

    // An error rendering a React view
    public static readonly renderError = 'react_render_error';

    // An error from the business API when the user edits the browser URL and tries to access an unauthorised company
    public static readonly companyNotFound = 'company_not_found';

    // An error from the business API when the user edits the browser URL and supplies a non-numeric company id
    public static readonly invalidCompanyId = 'invalid_company_id';
}
