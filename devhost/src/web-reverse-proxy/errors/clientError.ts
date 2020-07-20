/*
 * Our client error format consists of an error and error_description
 */
export class ClientError extends Error {

    private readonly _statusCode: number;
    private readonly _errorCode: string;
    private _logContext: string;

    /*
     * Construct from fields returned to the client
     */
    public constructor(statusCode: number, errorCode: string, message: string) {

        // Set common fields
        super(message);
        this._statusCode = statusCode;
        this._errorCode = errorCode;
        this._logContext = '';

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public set logContext(value: string) {
        this._logContext = value;
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

        const data: any = {
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
