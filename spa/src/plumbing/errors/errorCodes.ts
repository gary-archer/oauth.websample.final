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

    // A technical problem during silent token renewal on an iframe
    public static readonly tokenRenewalIframeError = 'token_renewal_iframe_error';

    // The OAuth error when a refresh token expires
    public static readonly refreshTokenExpired = 'invalid_grant';

    // An error starting a logout request, such as contacting the metadata endpoint
    public static readonly logoutRequestFailed = 'logout_request_failed';

    // A general exception in the UI
    public static readonly generalUIError = 'ui_error';

    // An error making an Ajax call to get the configuration data
    public static readonly webAjaxError = 'web_ajax_error';

    // An error receiving configuration data downloaded as static content
    public static readonly webDataError = 'web_data_error';

    // An error making an Ajax call to get API data
    public static readonly apiNetworkError = 'api_network_error';

    // An error receiving API data as JSON
    public static readonly apiDataError = 'api_data_error';

    // An error response fropm the API
    public static readonly apiResponseError = 'api_response_error';

    // An error rendering a ReactJs view
    public static readonly renderError = 'react_render_error';

    // Returned by the API when the user edits the browser URL and ties to access an unauthorised company
    public static readonly companyNotFound = 'company_not_found';

    // Returned by the API when the user edits the browser URL and supplies a non numeric company id
    public static readonly invalidCompanyId = 'invalid_company_id';
}
