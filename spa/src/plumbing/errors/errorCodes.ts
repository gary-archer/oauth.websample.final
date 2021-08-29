/*
 * Error codes that the UI can program against
 */
export class ErrorCodes {

    // An error when the Proxy API is called to get a token but there is no auth cookie yet
    public static readonly cookieNotFound = 'cookie_not_found';

    // An error from the Proxy API when the SPA sends the wrong data, such as the anti forgery token
    public static readonly invalidData = 'invalid_data';

    // Used to indicate that the API cannot be called until the user logs in
    public static readonly loginRequired = 'login_required';

    // A technical error starting a login request via the proxy API
    public static readonly loginRequestFailed = 'login_request_failed';

    // A technical error processing the login response and calling the proxy API
    public static readonly loginResponseFailed = 'login_response_failed';

    // A technical problem during token refresh
    public static readonly tokenRefreshError = 'token_refresh_error';

    // Returned when the Authorization Server indicates that the refresh token in the auth cookie is expired
    public static readonly invalidGrant = 'invalid_grant';

    // An error starting a logout request
    public static readonly logoutRequestFailed = 'logout_request_failed';

    // Used when running in a mobile web view and the AppAuth redirect is cancelled
    public static readonly redirectCancelled = 'redirect_cancelled';

    // A general exception in the UI
    public static readonly generalUIError = 'ui_error';

    // An error making an HTTP call
    public static readonly networkError = 'network_error';

    // An error receiving data as JSON
    public static readonly jsonDataError = 'json_data_error';

    // A general error response from the API
    public static readonly responseError = 'http_response_error';

    // An error rendering a ReactJS view
    public static readonly renderError = 'react_render_error';

    // An error from the business API when the user edits the browser URL and tries to access an unauthorised company
    public static readonly companyNotFound = 'company_not_found';

    // An error from the business API when the user edits the browser URL and supplies a non numeric company id
    public static readonly invalidCompanyId = 'invalid_company_id';
}
