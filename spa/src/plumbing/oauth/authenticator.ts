/*
 * An interface to abstract authentication differences between web and mobile hosts
 */
export interface Authenticator {

    // A method called during page load to initialise the OIDC client library
    initialise(): Promise<void>;

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
