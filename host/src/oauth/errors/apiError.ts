/*
 * A range for random error ids
 */
import {ClientError} from './clientError';

/*
 * An error entity that the API will log
 */
export class ApiError extends Error {

    private readonly _statusCode: number;
    private readonly _errorCode: string;
    private _details: any;

    /*
     * Errors are categorized by error code
     */
    public constructor(errorCode: string, userMessage: string, stack?: string | undefined) {

        super(userMessage);

        // Give fields their default values
        this._statusCode = 500;
        this._errorCode = errorCode;
        this._details = '';

        // Record the stack trace of the original error
        if (stack) {
            this.stack = stack;
        }

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public get details(): any {
        return this._details;
    }

    public set details(details: any) {
        this._details = details;
    }

    /*
     * Return an object ready to log, including the stack trace
     */
    public toLogFormat(): any {

        const serviceError: any = {
        };

        if (this.details) {
            serviceError.details =  this._details;
        }

        // Include the stack trace as an array within the JSON object
        if (this.stack) {

            const frames: string[] = [];
            const items = this.stack.split('\n').map((x: string) => x.trim()) as string[];
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
    public toClientError(): ClientError {
        return new ClientError(this._statusCode, this._errorCode, this.message);
    }
}
