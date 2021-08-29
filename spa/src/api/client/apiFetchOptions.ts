import {Method} from 'axios';

/*
 * Internal options when making an API request
 */
export interface ApiFetchOptions {

    // The API endpoint's path
    path: string;

    // Whether a GET, POST etc
    method: Method;

    // An optional request payload
    dataToSend?: any;

    // We can send an option to make the API fail, to demonstrate 500 handling
    causeError: boolean;
}
