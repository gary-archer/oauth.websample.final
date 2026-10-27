/*
 * A cache to prevent redundant HTTP requests
 * This is used when the data for a view has already been retrieved
 * This includes during back navigation and re-entrancy due to React strict mode
 */
export class FetchCache {

    // A map of cache keys (URLs) to API responses
    private requests: Record<string, any> = {};

    /*
     * Create an item with no data when an API request is triggered
     */
    public setItem(key: string, data: any): void {
        this.requests[key] = data;
    }

    /*
     * Get an item if it exists
     */
    public getItem(key: string): any {
        return this.requests[key];
    }

    /*
     * Remove an item when forcing a reload
     */
    /* eslint-disable @typescript-eslint/no-dynamic-delete */
    public removeItem(key: string): void {

        if (this.requests[key]) {
            delete this.requests[key];
        }
    }

    /*
     * Clear the cache after a logout on another browser tab
     */
    public clearAll(): void {
        this.requests = {};
    }
}
