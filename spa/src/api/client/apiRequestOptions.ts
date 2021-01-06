/*
 * Special options when making an API request
 */
export interface ApiRequestOptions {

    // We can send an option to make the API fail, to demonstrate 500 handling
    causeError: boolean;
}
