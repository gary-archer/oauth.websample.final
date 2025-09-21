import {UIError} from '../../plumbing/errors/uiError';

/*
 * A cache item represents an API response
 */
export class FetchCacheItem {

    private isLoading: boolean;
    private data: any;
    private error: UIError | null;

    public constructor() {
        this.isLoading = true;
        this.data = null;
        this.error = null;
    }

    public getIsLoading(): boolean {
        return this.isLoading;
    }

    public getData(): any {
        return this.data;
    }

    public setData(value: any): void {
        this.isLoading = false;
        this.data = value;
        this.error = null;
    }

    public getError(): UIError | null {
        return this.error;
    }

    public setError(value: UIError | null): void {
        this.isLoading = false;
        this.error = value;
        this.data = null;
    }
}
