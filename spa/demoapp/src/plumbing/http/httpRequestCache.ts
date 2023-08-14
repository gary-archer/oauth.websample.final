import {HttpRequestCacheItem} from './httpRequestCacheItem';

/*
 * A cache to prevent redundant HTTP requests
 * This is used when the data for a view has already been retrieved
 * This includes during back navigation and re-entrancy due to React strict mode
 */
export class HttpRequestCache {

    // A map of named API requests to the result
    private readonly requests: { [name: string]: HttpRequestCacheItem } = {};

    /*
     * Create an item the first time
     */
    public createItem(name: string): HttpRequestCacheItem {

        const item = {
            data: null,
            error: null,
        };
        this.requests[name] = item;
        return item;
    }

    /*
     * Return an existing item
     */
    public getItem(name: string): HttpRequestCacheItem | null {
        return this.requests[name];
    }
}
