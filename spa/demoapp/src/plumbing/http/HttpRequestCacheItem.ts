import { UIError } from '../errors/lib';

export interface HttpRequestCacheItem {

    isLoading: boolean;

    data: any;

    error: UIError | null;
}
