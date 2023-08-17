/*
 * Input and output when making an HTTP request
 */
export class HttpClientContext {

    private _forceReload: boolean;
    private _causeError: boolean;
    private _urls: string[];

    public constructor() {
        this._forceReload = false;
        this._causeError = false;
        this._urls = [];
    }

    public get forceReload(): boolean {
        return this._forceReload;
    }

    public set forceReload(value: boolean) {
        this._forceReload = value;
    }

    public get causeError(): boolean {
        return this._causeError;
    }

    public set causeError(value: boolean) {
        this._causeError = value;
    }

    public get urls(): string[] {
        return this._urls;
    }

    public addUrl(value: string) {
        this._urls.push(value);
    }
}
