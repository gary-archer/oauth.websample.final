/*
 * An interface to abstract aiuthentication differences between providers
 */
export interface Authenticator {

    // Return whether we have a user object and tokens
    isLoggedIn(): Promise<boolean>;

    // Try to get an access token
    getAccessToken(): Promise<string>;

    // Try to refresh the access token when it expires
    refreshAccessToken(): Promise<string>;

    // Start a login redirect
    startLogin(returnLocation?: string): Promise<void>;

    // Handle a main window login response when the page loads
    handleLoginResponse(): Promise<void>;

    // Initiate a logout redirect
    startLogout(): Promise<void>;

    // For testing, make the access token act like it is expired
    expireAccessToken(): Promise<void>;

    // For testing, make the refresh token act like it is expired
    expireRefreshToken(): Promise<void>;
}
