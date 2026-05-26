/*
 * An interface to represent OAuth related operations for the SPA
 */
export interface OAuthClient {

    // Indicate whether logged in
    isLoggedIn(): boolean;

    // Perform a login redirect
    login(currentLocation: string): Promise<void>;

    // Handle page loads and process login responses when required
    handlePageLoad(): Promise<string | null>;

    // Perform a logout redirect
    logout(): Promise<void>;

    // Allow the app to clear its login state after certain errors
    clearLoginState(): void;

    // Call the OAuth agent to refresh the access token and rewrite cookies
    synchronizedRefresh(): Promise<void>

    // For testing, call the OAuth agent to make the access token cookie act expired
    expireAccessToken(): Promise<void>;

    // For testing, call the OAuth agent to make the refresh token cookie act expired
    expireRefreshToken(): Promise<void>;
}
