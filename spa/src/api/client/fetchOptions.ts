/*
 * Input when making a cacheable fetch request
 */
export interface FetchOptions {
    cacheKey: string;
    forceReload: boolean;
    causeError: boolean;
}
