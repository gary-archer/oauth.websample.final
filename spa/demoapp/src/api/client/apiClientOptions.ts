/*
 * External options when making an API request
 */
export interface ApiClientOptions {

    // Used with a reload data button
    forceReload: boolean;

    // An option to make the API fail, to rehearse 500 error handling
    causeError: boolean;
}
