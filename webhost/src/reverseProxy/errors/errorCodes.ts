/*
 * A list of API error codes
 */
export class ErrorCodes {

    // An API request to an invalid route
    public static readonly requestNotFound = 'request_not_found';

    // The standard error code for when the user session has expired, and which the SPA must check for
    public static readonly invalidGrant = 'invalid_grant';

    // A generic error code to indicate that cookies or other fields were not supplied correctly
    public static readonly securityVerificationFailed = 'security_verification_failed';

    // A problem reading file data
    public static readonly fileReadError = 'file_read_error';

    // A generic server error
    public static readonly serverError = 'server_error';

    // A problem making an HTTP request to the Authorization Server
    public static readonly httpRequestError = 'http_request_error';
}
