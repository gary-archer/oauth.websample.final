/*
 * A cache item represents a succesful API response
 */
export class FetchCacheItem {

    private data: any;

    public constructor() {
        this.data = null;
    }

    public setData(value: any): void {
        this.data = value;
    }

    public getData(): any {
        return this.data;
    }
}
