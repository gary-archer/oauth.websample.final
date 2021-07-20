import {Method} from 'axios';
import {ApiRequestOptions} from './apiRequestOptions';

/*
 * An abstraction for calling an API in a generic manner, which supports web workers
 */
export interface Channel {
    fetch(path: string, method: Method, dataToSend?: any, options?: ApiRequestOptions): Promise<any>;
}