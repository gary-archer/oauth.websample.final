/*
 * An error entity containing translated error data for any kind of error
 */
export class UIError extends Error {

    private _area: string;
    private _errorCode: string;
    private _userAction: string;
    private _utcTime: string;
    private _statusCode: number;
    private _instanceId: number;
    private _details: any;
    private _url: string;

    /*
     * All types of error supply at least these fields
     */
    public constructor(area: string, errorCode: string, userMessage: string, stack?: string | undefined) {

        super(userMessage);

        this._area = area;
        this._errorCode = errorCode;
        this._userAction = 'Please retry the operation';
        this._utcTime = new Date().toISOString();
        this._statusCode = 0;
        this._instanceId = 0;
        this._details = '';
        this._url = '';

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);

        // Store the stack of the original exception if provided
        if (stack) {
            this.stack = stack;
        }
    }

    public get area(): string {
        return this._area;
    }

    public get errorCode(): string {
        return this._errorCode;
    }

    public set errorCode(value: string) {
        this._errorCode = value;
    }

    public get userAction(): string {
        return this._userAction;
    }

    public set userAction(value: string) {
        this._userAction = value;
    }

    public get utcTime(): string {
        return this._utcTime;
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public set statusCode(value: number) {
        this._statusCode = value;
    }

    public get instanceId(): number {
        return this._instanceId;
    }

    public get details(): any {
        return this._details;
    }

    public set details(value: any)  {
        this._details = value;
    }

    public get url(): string {
        return this._url;
    }

    public set url(value: string) {
        this._url = value;
    }

    /*
     * Override details when an API 500 error is handled
     */
    public setApiErrorDetails(area: string, id: number, utcTime: string): void {
        this._area = area;
        this._instanceId = id;
        this._utcTime = utcTime;
    }

    /*
     * Serialize the object when throwing from a web worker
     */
    public toData(): any {

        return {
            area: this._area,
            errorCode: this._errorCode,
            message: this.message,
            stack: this.stack,
            userAction: this._userAction,
            utcTime: this.utcTime,
            statusCode: this._statusCode,
            instanceId: this._instanceId,
            details: this._details,
            url: this._url,
        };
    }
}
