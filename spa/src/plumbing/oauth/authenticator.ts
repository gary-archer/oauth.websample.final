/*
 * An interface to manage OAuth operations
 */
export interface Authenticator {

    // Perform a login redirect
    login(): Promise<void>;

    // Handle page loads and process login responses when required
    handlePageLoad(): Promise<boolean>;

    // Perform a logout redirect
    logout(): Promise<void>;

    // For testing, make the access token act like it is expired
    expireAccessToken(): Promise<void>;

    // For testing, make the refresh token act like it is expired
    expireRefreshToken(): Promise<void>;
}
