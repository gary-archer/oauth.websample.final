/*
 * An error entity containing translated error data for any kind of error
 */
export class UIError extends Error {

    private area: string;
    private errorCode: string;
    private userAction: string;
    private utcTime: string;
    private statusCode: number;
    private instanceId: number;
    private details: any;
    private url: string;

    /*
     * All types of error supply at least these fields
     */
    public constructor(area: string, errorCode: string, userMessage: string, stack?: string | undefined) {

        super(userMessage);

        this.area = area;
        this.errorCode = errorCode;
        this.userAction = 'Please retry the operation';
        this.utcTime = new Date().toISOString();
        this.statusCode = 0;
        this.instanceId = 0;
        this.details = '';
        this.url = '';

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);

        // Store the stack of the original exception if provided
        if (stack) {
            this.stack = stack;
        }
    }

    public getArea(): string {
        return this.area;
    }

    public getErrorCode(): string {
        return this.errorCode;
    }

    public setErrorCode(value: string): void {
        this.errorCode = value;
    }

    public getUserAction(): string {
        return this.userAction;
    }

    public setUserAction(value: string): void {
        this.userAction = value;
    }

    public getUtcTime(): string {
        return this.utcTime;
    }

    public getStatusCode(): number {
        return this.statusCode;
    }

    public setStatusCode(value: number): void {
        this.statusCode = value;
    }

    public getInstanceId(): number {
        return this.instanceId;
    }

    public getDetails(): any {
        return this.details;
    }

    public setDetails(value: any): void {
        this.details = value;
    }

    public getUrl(): string {
        return this.url;
    }

    public setUrl(value: string): void {
        this.url = value;
    }

    /*
     * Override details when an API 500 error is handled
     */
    public setApiErrorDetails(area: string, id: number, utcTime: string): void {
        this.area = area;
        this.instanceId = id;
        this.utcTime = utcTime;
    }

    /*
     * Serialize the object when throwing from a web worker
     */
    public toData(): any {

        return {
            area: this.area,
            errorCode: this.errorCode,
            message: this.message,
            stack: this.stack,
            userAction: this.userAction,
            utcTime: this.utcTime,
            statusCode: this.statusCode,
            instanceId: this.instanceId,
            details: this.details,
            url: this.url,
        };
    }
}
