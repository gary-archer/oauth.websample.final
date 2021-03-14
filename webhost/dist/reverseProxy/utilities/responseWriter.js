"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseWriter = void 0;
/*
 * Helper methods to write the response
 */
class ResponseWriter {
    /*
     * Return data to the caller, which could be a success or error object
     */
    static writeObjectResponse(response, statusCode, data) {
        // Write standard headers
        response.setHeader('Content-Type', 'application/json');
        // Write the data
        response.status(statusCode).send(JSON.stringify(data));
    }
}
exports.ResponseWriter = ResponseWriter;
