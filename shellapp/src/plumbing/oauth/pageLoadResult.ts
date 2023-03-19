/*
 * The result of a page load, to provide the login state
 */
export interface PageLoadResult {

    // True if there are valid cookies
    isLoggedIn: boolean;

    // True if a login response has just been handled
    handled: boolean;
}
