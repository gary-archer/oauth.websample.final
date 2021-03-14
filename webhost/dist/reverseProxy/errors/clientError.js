"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientError = void 0;
/*
 * Our client error format consists of an error and error_description
 */
class ClientError extends Error {
    /*
     * Construct from fields returned to the client
     */
    constructor(statusCode, errorCode, message) {
        // Set common fields
        super(message);
        this._statusCode = statusCode;
        this._errorCode = errorCode;
        this._logContext = '';
        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }
    get statusCode() {
        return this._statusCode;
    }
    set logContext(value) {
        this._logContext = value;
    }
    /*
     * Return an object that can be serialized by calling JSON.stringify
     */
    toResponseFormat() {
        return {
            error: this._errorCode,
            error_description: this.message,
        };
    }
    /*
     * Similar to the above but includes details outside the response body
     */
    toLogFormat() {
        const data = {
            status: this._statusCode,
            clientError: {
                error: this._errorCode,
                error_description: this.message,
            },
        };
        if (this._logContext) {
            data.context = this._logContext;
        }
        return data;
    }
}
exports.ClientError = ClientError;
