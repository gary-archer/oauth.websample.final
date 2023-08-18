/*
 * Error codes that the UI can program against
 */
export class ErrorCodes {

    // An error rendering a React view
    public static readonly renderError = 'react_render_error';

    // A general exception in the UI
    public static readonly generalUIError = 'ui_error';

    // An error making an HTTP call
    public static readonly networkError = 'network_error';

    // An error receiving data as JSON
    public static readonly jsonDataError = 'json_data_error';

    // A general error response from the API
    public static readonly responseError = 'http_response_error';

    // Used to indicate that the API cannot be called until the user logs in
    public static readonly loginRequired = 'login_required';

    // An error getting the login state
    public static readonly loginStateError = 'login_state_error';

    // A technical problem during token refresh
    public static readonly tokenRefreshError = 'token_refresh_error';

    // An error returned when the  generic 401 error returned to clients who send incorrect data
    public static readonly sessionExpiredError = 'session_expired';

    // An error when testing token expiry
    public static readonly expiryTestError = 'expiry_test';

    // An error from the business API when the user edits the browser URL and tries to access an unauthorised company
    public static readonly companyNotFound = 'company_not_found';

    // An error from the business API when the user edits the browser URL and supplies a non numeric company id
    public static readonly invalidCompanyId = 'invalid_company_id';
}
