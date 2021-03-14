"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
/*
 * A list of API error codes
 */
class ErrorCodes {
}
exports.ErrorCodes = ErrorCodes;
// An API request to an invalid route
ErrorCodes.requestNotFound = 'request_not_found';
// The standard error code for when the user session has expired, and which the SPA must check for
ErrorCodes.invalidGrant = 'invalid_grant';
// A generic error code to indicate that cookies or other fields were not supplied correctly
ErrorCodes.securityVerificationFailed = 'security_verification_failed';
// A problem reading file data
ErrorCodes.fileReadError = 'file_read_error';
// A generic server error
ErrorCodes.serverError = 'server_error';
// A problem making an HTTP request to the Authorization Server
ErrorCodes.httpRequestError = 'http_request_error';
