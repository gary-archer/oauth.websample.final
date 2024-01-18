/*
 * Data returned from the OAuth agent API to the SPA, to inform it of the logged in state
 */
export interface EndLoginResponse {

    // True if there are valid cookies
    isLoggedIn: boolean;

    // True if an authorization response has just been handled
    handled: boolean;

    // A new value is generated for each authenticated user session, then used across all browser tabs
    antiForgeryToken: string | null;
}
