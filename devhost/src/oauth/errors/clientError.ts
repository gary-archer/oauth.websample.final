/*
 * Our client error format consists of an error and error_description
 */
export class ClientError extends Error {

    private readonly _statusCode: number;
    private readonly _errorCode: string;

    public constructor(statusCode: number, errorCode: string, message: string) {

        // Set common fields
        super(message);
        this._statusCode = statusCode;
        this._errorCode = errorCode;

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    /*
     * Return an object that can be serialized by calling JSON.stringify
     */
    public toResponseFormat(): any {

        return {
            error: this._errorCode,
            error_description: this.message,
        };
    }

    /*
     * Similar to the above but includes details outside the response body
     */
    public toLogFormat(): any {

        return {
            status: this._statusCode,
            clientError: {
                error: this._errorCode,
                error_description: this.message,
            },
        };
    }
}
