import {UIError} from '../errors/lib';
import {HttpRequestCacheItem} from './HttpRequestCacheItem';

/*
 * A cache to prevent redundant HTTP requests
 * This is used when the data for a view has already been retrieved
 * This includes during back navigation and re-entrancy due to React strict mode
 */
export class HttpRequestCache {

    // A map of URLs to request items
    private readonly requests: { [name: string]: HttpRequestCacheItem } = {};

    /*
     * Return existing data or not found
     */
    public getData(url: string): HttpRequestCacheItem | null {
        return this.requests[url];
    }

    /*
     * Create an item
     */
    public createItem(url: string): void {

        const item = {
            data: null,
            error: null,
        };
        this.requests[url] = item;
    }

    /*
     * Store data for a URL
     */
    public setData(url: string, data: any): void {

        const item = this.requests[url];
        if (item) {
            item.data = data;
        }
    }

    /*
     * Store an error for a URL
     */
    public setError(url: string, error: UIError): void {

        const item = this.requests[url];
        if (item) {
            item.error = error;
        }
    }
}
