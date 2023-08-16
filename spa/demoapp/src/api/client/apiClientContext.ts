/*
 * Input and output when making an API request
 */
export class ApiClientContext {

    private _forceReload: boolean;
    private _causeError: boolean;
    private _url: string;

    public constructor() {
        this._forceReload = false;
        this._causeError = false;
        this._url = '';
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

    public get url(): string {
        return this._url;
    }

    public set url(value: string) {
        this._url = value;
    }
}
