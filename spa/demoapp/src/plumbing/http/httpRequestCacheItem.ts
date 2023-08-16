import {UIError} from '../errors/lib';

/*
 * The state of request data mapped to a URL
 */
export class HttpRequestCacheItem {

    private _isLoading: boolean;
    private _data: any;
    private _error: UIError | null;

    public constructor() {
        this._isLoading = true;
        this._data = null;
        this._error = null;
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public get data(): any {
        return this._data;
    }

    public set data(value: any) {
        this._data = value;
    }

    public get error(): UIError | null {
        return this._error;
    }

    public set error(value: UIError | null) {
        this._error = value;
    }
}
