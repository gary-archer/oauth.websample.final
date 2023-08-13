import {UIError} from '../errors/lib';

/*
 * The state of request data mapped to a URL
 */
export interface HttpRequestCacheItem {

    isLoading: boolean;

    data: any;

    error: UIError | null;
}
