/*
 * Error codes that the UI can program against
 */
export class ErrorCodes {

    // Used to indicate that the API cannot be called until the user logs in
    // Also returned by OAuth error responses when token renewal via prompt=none fails
    public static readonly loginRequired = 'login_required';

    // A technical error starting a login request, such as contacting the metadata endpoint
    public static readonly loginRequestFailed = 'login_request_failed';

    // A technical error processing the login response containing the authorization code
    public static readonly loginResponseFailed = 'login_response_failed';

    // A technical problem during background token renewal
    public static readonly tokenRenewalError = 'token_renewal_error';

    // The OAuth error when a refresh token expires
    public static readonly invalidGrant = 'invalid_grant';

    // An error starting a logout request, such as contacting the metadata endpoint
    public static readonly logoutRequestFailed = 'logout_request_failed';

    // Used when running in a mobile web view and the AppAuth redirect is cancelled
    public static readonly redirectCancelled = 'redirect_cancelled';

    // A general exception in the UI
    public static readonly generalUIError = 'ui_error';

    // An error making an Ajax call
    public static readonly networkError = 'network_error';

    // An error receiving data as JSON
    public static readonly jsonDataError = 'json_data_error';

    // An error response fropm the API
    public static readonly responseError = 'http_response_error';

    // An error rendering a ReactJs view
    public static readonly renderError = 'react_render_error';

    // Returned by the API when the user edits the browser URL and ties to access an unauthorised company
    public static readonly companyNotFound = 'company_not_found';

    // Returned by the API when the user edits the browser URL and supplies a non numeric company id
    public static readonly invalidCompanyId = 'invalid_company_id';
}
