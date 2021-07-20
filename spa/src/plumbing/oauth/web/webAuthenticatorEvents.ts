/*
 * Events that the main part of the app calls in order to update the web worker
 */
export interface WebAuthenticatorEvents {

    // Provide an anti forgery token when the page loads, if available
    onPageLoad(antiForgeryToken: string): Promise<void>;

    // Clear the access token from the worker's memory
    onClearAccessToken(): Promise<void>;

    // For testing purposes, make the access token in the web worker act expired
    onExpireAccessToken(): Promise<void>;

    // Clean up the worker upon logout
    onLogout(): Promise<void>;
}
