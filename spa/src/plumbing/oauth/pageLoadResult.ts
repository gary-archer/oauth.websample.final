/*
 * The result of a page load, to provide the login state
 */
export interface PageLoadResult {

    // True if there are valid cookies
    isLoggedIn: boolean;

    // True if an Authorization response has just been handled
    handled: boolean;

    // The pre login location to navigate to
    appLocation: string;
}
