import {Method} from 'axios';
import {ApiClientOptions} from './apiClientOptions';

/*
 * Internal options when making an API request
 */
export interface ApiFetchOptions {

    // The API endpoint relative path
    path: string;

    // Whether a GET, POST etc
    method: Method;

    // An optional request payload
    dataToSend: any;

    // Options supplied via the caller of the ApiClient class
    callerOptions: ApiClientOptions;
}
