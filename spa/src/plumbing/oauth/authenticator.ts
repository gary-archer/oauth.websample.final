/*
 * An interface to abstract aiuthentication differences between providers
 */
export interface Authenticator {

    // Try to get an access token
    getAccessToken(): Promise<string>;

    // Start a login redirect
    startLoginRedirect(): Promise<void>;

    // Handle a main window login response when the page loads
    handleLoginResponse(): Promise<void>;

    // Clear the access token from HTML 5 storage
    clearAccessToken(): Promise<void>;

    // Update the access token in HTML 5 storage to make it act like it is expired
    expireAccessToken(): Promise<void>;

    // Initiate a logout redirect
    startLogout(): Promise<void>;
}
