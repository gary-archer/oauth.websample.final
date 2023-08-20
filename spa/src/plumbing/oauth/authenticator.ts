import {AxiosRequestConfig} from 'axios';
import {PageLoadResult} from './pageLoadResult';

/*
 * An interface to represent authentication related operations for a micro UI
 */
export interface Authenticator {

    // Indicate whether logged in
    isLoggedIn(): boolean;

    // Perform a login redirect
    login(currentLocation: string): Promise<void>;

    // Handle page loads and process login responses when required
    handlePageLoad(navigateAction: (path: string) => void): Promise<PageLoadResult>;

    // Perform a logout redirect
    logout(): Promise<void>;

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
