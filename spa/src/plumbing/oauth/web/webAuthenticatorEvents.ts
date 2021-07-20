/*
 * Token events that the web authenticator needs to act upon
 */
export interface WebAuthenticatorEvents {

    // Clear the access token from memory
    onClearAccessToken(): Promise<void>;

    // For testing purposes, make the access token act expired
    onExpireAccessToken(): Promise<void>;
}
