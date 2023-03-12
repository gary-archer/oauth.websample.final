import {AxiosRequestConfig} from 'axios';
import {PageLoadResult} from './pageLoadResult';

/*
 * The authenticator interface
 */
export interface Authenticator {

    // Handle page loads to start or end logins when required
    handlePageLoad(): Promise<PageLoadResult>;

    // Begin a login
    login(currentPath: string): void;

    // Perform a logout redirect
    logout(): void;

    // Handle logout on another browser tab or in another micro UI
    onLoggedOut(): void;

    // For testing, make the access token act like it is expired
    expireAccessToken(): Promise<void>;

    // For testing, make the refresh token act like it is expired
    expireRefreshToken(): Promise<void>;

    // Handle sending credentials to APIs after login
    onCallApi(options: AxiosRequestConfig, isRetry: boolean): Promise<void>;
}
