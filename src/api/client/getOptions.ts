/*
 * Input when making a cacheable GET request
 */
export interface GetOptions {
    cacheKey: string;
    forceReload: boolean;
    causeError: boolean;
}
