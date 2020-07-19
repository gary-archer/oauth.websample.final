/*
 * A list of API error codes
 */
export class ErrorCodes {

    // An API request to an invalid route
    public static readonly requestNotFound = 'request_not_found';

    // A problem reading file data
    public static readonly fileReadError = 'file_read_error';

    // A generic server error
    public static readonly serverError = 'server_error';

    // A problem making an HTTP request
    public static readonly httpRequestError = 'http_request_error';

    // Indicate that a request to refresh a token is not valid
    public static readonly invalidGrant = 'invalid_grant';
}
