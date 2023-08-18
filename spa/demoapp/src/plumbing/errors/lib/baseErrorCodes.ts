/*
 * Error codes used by multiple micro UIs
 */
export class BaseErrorCodes {

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
}
