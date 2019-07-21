/*
 * An error class focused on UI scenarios
 */
export class UIError extends Error {

    // Technical fields to display
    private _area: string;
    private _errorCode: string;
    private _utcTime: string;
    private _statusCode: number;
    private _instanceId: number;
    private _details: string;

    // Additional details that can be shown during development
    private _url: string;
    private _stackFrames: string[];

    /*
     * All types of error supply at least these fields
     */
     public constructor(area: string, errorCode: string, userMessage: string) {

        super(userMessage);

        this._area = area;
        this._errorCode = errorCode;
        this._utcTime = new Date().toISOString();
        this._statusCode = 0;
        this._instanceId = 0;
        this._details = '';
        this._url = '';
        this._stackFrames = [];

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);

        // Initialise the stack
        this.addToStackFrames(this.stack);
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

    public get details(): string {
        return this._details;
    }

    public set details(value: string)  {
        this._details = value;
    }

    public get url(): string {
        return this._url;
    }

    public set url(value: string) {
        this._url = value;
    }

    public get stackFrames(): string[] {
        return this._stackFrames;
    }

    /*
     * Add details to the stack data, from ourself or downstream errors
     */
    public addToStackFrames = (stack: any) => {
        const items = stack.split('\n').map((x: string) => x.trim()) as string[];
        items.forEach((i) => {
            this._stackFrames.push(i);
        });
    }

    /*
     * Override details when an API 500 error is handled
     */
    public setApiErrorDetails(area: string, id: number, utcTime: string) {
        this._area = area;
        this._instanceId = id;
        this._utcTime = utcTime;
    }
}
