/*
 * An interface to abstract authentication differences between web and mobile hosts
 */
export interface Authenticator {

    // Try to get an access token
    getAccessToken(): Promise<string>;

    // Try to refresh the access token when it expires
    refreshAccessToken(): Promise<string>;

    // Perform a login redirect
    login(): Promise<void>;

    // Handle a main window login response when the page loads
    handleLoginResponse(): Promise<void>;

    // Perform a logout redirect
    logout(): Promise<void>;

    // For testing, make the access token act like it is expired
    expireAccessToken(): Promise<void>;

    // For testing, make the refresh token act like it is expired
    expireRefreshToken(): Promise<void>;
}
