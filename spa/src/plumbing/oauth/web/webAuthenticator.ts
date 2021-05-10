import {Authenticator} from '../authenticator';

/*
 * A web authenticator with standard behaviour that can be extended via a subclass
 */
export class WebAuthenticator implements Authenticator {

    /*
     * Create the user manager during initialisation
     */
    public async initialise(): Promise<void> {
        throw new Error('not implemented');
    }

    /*
     * Get an access token if possible, which will retrieve it from storage
     */
    public async getAccessToken(): Promise<string> {
        throw new Error('not implemented');
    }

    /*
     * Try to refresh an access token in a synchronised manner across multiple views
     */
    public async refreshAccessToken(): Promise<string> {
        throw new Error('not implemented');
    }

    /*
     * Trigger the login redirect
     */
    public async login(): Promise<void> {
        throw new Error('not implemented');
    }

    /*
     * Handle login responses on the main window
     */
    public async handleLoginResponse(): Promise<void> {
        throw new Error('not implemented');
    }

    /*
     * Do the logout redirect
     */
    public async logout(): Promise<void> {
        throw new Error('not implemented');
    }

    /*
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {
        throw new Error('not implemented');
    }

    /*
     * For testing, make the refresh token act like it is expired, when applicable
     */
    public async expireRefreshToken(): Promise<void> {
        throw new Error('not implemented');
    }

    /*
     * Manage updates based on the user typing in a hash fragment URL such as #log=debug
     */
    public updateLogLevelIfRequired(): void {
        throw new Error('not implemented');
    }
}
