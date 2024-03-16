/*
 * Data returned from the OAuth agent API to the SPA, to inform it of the logged in state
 */
export interface EndLoginResponse {

    // True if an authorization response has just been handled
    handled: boolean;

    // True if there are valid cookies
    isLoggedIn: boolean;

    // A new value is generated for each authenticated user session, then used across all browser tabs
    csrfToken: string | null;
}
