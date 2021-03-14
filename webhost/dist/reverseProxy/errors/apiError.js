"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
const clientError_1 = require("./clientError");
/*
 * An error entity that the API will log
 */
class ApiError extends Error {
    /*
     * Errors are categorized by error code
     */
    constructor(errorCode, userMessage, stack) {
        super(userMessage);
        // Give fields their default values
        this._statusCode = 500;
        this._errorCode = errorCode;
        this._url = '';
        this._details = '';
        // Record the stack trace of the original error
        if (stack) {
            this.stack = stack;
        }
        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }
    get url() {
        return this._url;
    }
    set url(url) {
        this._url = url;
    }
    set statusCode(statusCode) {
        this._statusCode = statusCode;
    }
    get details() {
        return this._details;
    }
    set details(details) {
        this._details = details;
    }
    /*
     * Return an object ready to log, including the stack trace
     */
    toLogFormat() {
        const serviceError = {};
        if (this.url) {
            serviceError.url = this._url;
        }
        if (this.details) {
            serviceError.details = this._details;
        }
        // Include the stack trace as an array within the JSON object
        if (this.stack) {
            const frames = [];
            const items = this.stack.split('\n').map((x) => x.trim());
            items.forEach((i) => {
                frames.push(i);
            });
            serviceError.stack = frames;
        }
        return {
            statusCode: this._statusCode,
            clientError: this.toClientError().toResponseFormat(),
            serviceError,
        };
    }
    /*
     * Translate to the OAuth response format of an error and error_description
     */
    toClientError() {
        return new clientError_1.ClientError(this._statusCode, this._errorCode, this.message);
    }
}
exports.ApiError = ApiError;
