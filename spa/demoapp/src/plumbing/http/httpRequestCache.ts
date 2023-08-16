import {HttpRequestCacheItem} from './httpRequestCacheItem';

/*
 * A cache to prevent redundant HTTP requests
 * This is used when the data for a view has already been retrieved
 * This includes during back navigation and re-entrancy due to React strict mode
 */
export class HttpRequestCache {

    // A map of URLs to the result
    private readonly _requests: { [url: string]: HttpRequestCacheItem } = {};

    /*
     * Create an item when an API request is triggered
     */
    public createItem(url: string): HttpRequestCacheItem {

        let item = this.getItem(url);
        if (!item) {

            item = new HttpRequestCacheItem();
            this._requests[url] = item;
        }

        return item;
    }

    /*
     * Get an item if it exists
     */
    public getItem(url: string): HttpRequestCacheItem | null {
        return this._requests[url];
    }

    /*
     * Remove an item if it exists
     */
    public removeItem(url: string): void {

        if (this._requests[url]) {
            delete this._requests[url];
        }
    }
}
