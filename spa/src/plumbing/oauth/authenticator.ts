/*
 * An interface to abstract aiuthentication differences between providers
 */
export interface Authenticator {

    // Get whether the app has any tokens
    isLoggedIn(): Promise<boolean>;

    // Try to get an access token
    getAccessToken(): Promise<string>;

    // Start a login redirect
    startLoginRedirect(returnLocation?: string): Promise<void>;

    // Handle a main window login response when the page loads
    handleLoginResponse(): Promise<void>;

    // Clear the access token
    clearAccessToken(): Promise<void>;

    // Update the access token to make it act like it is expired
    expireAccessToken(): Promise<void>;

    // Initiate a logout redirect
    startLogout(): Promise<void>;
}
