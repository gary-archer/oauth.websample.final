import {AxiosRequestConfig} from 'axios';

/*
 * An interface to represent authentication related operations for a micro UI
 */
export interface Authenticator {

    // Indicate whether logged in
    isLoggedIn(): boolean;

    // Redirect to the shell app to begin a login
    login(): void;

    // Redirect to the shell app to begin a logout
    logout(): void;

    // Handle a notification that a micro UI on another tab has logged out
    onLoggedOut(): void;

    // Return an anti forgery token to the API for when data changing commands are sent
    addAntiForgeryToken(options: AxiosRequestConfig): void;

    // Call the OAuth agent to refresh the access token and rewrite cookies
    synchronizedRefresh(): Promise<void>

    // Call the OAuth agent to make the access token cookie act expired
    expireAccessToken(): Promise<void>;

    // Call the OAuth agent to make the refresh token cookie act expired
    expireRefreshToken(): Promise<void>;
}
