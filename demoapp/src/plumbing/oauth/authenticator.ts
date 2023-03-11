import {PageLoadResult} from './pageLoadResult';

/*
 * The authenticator interface
 */
export interface Authenticator {

    // Perform a login redirect
    login(): Promise<void>;

    // Handle page loads and process login responses when required
    handlePageLoad(navigateAction: (path: string) => void): Promise<PageLoadResult>;

    // Perform a logout redirect
    logout(): Promise<void>;

    // Response to logout on another browser tab
    onLoggedOut(): Promise<void>;

    // For testing, make the access token act like it is expired
    expireAccessToken(): Promise<void>;

    // For testing, make the refresh token act like it is expired
    expireRefreshToken(): Promise<void>;
}
