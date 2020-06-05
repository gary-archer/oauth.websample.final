import {Authenticator} from '../authenticator';

/*
 * An implementation that calls back the hosting mobile app
 */
export class WebViewAuthenticator implements Authenticator {

    private readonly _mobileAuthenticator: any;

    public constructor() {
        this._mobileAuthenticator = (window as any).mobileAuthenticator;
    }

    /*
     * Do initial setup
     */
    public async initialise(): Promise<void> {
    }

    /*
     * Return true if we have tokens
     */
    public isLoggedIn(): boolean {
        return false;
    }

    /*
     * Try to get an access token from the mobile app
     */
    public async getAccessToken(): Promise<string> {
        
        const x = this._mobileAuthenticator.getAccessToken('Input from SPA innit');
        console.log(`SPA received response from mobile side: ${x}`);
        return x;
    }

    /*
     * Ask the mobile app to use its refresh tokenm to get a new access token
     */
    public async refreshAccessToken(): Promise<string> {
        return '';
    }

    /*
     * Start a login redirect
     */
    public async startLogin(returnLocation?: string): Promise<void> {
    }

    /*
     * Handle a main window login response when the page loads
     */
    public async handleLoginResponse(): Promise<void> {
    }

    /*
     * Initiate a logout redirect
     */
    public async startLogout(): Promise<void> {
    }

    /*
     * For testing, make the access token act like it is expired
     */
    public async expireAccessToken(): Promise<void> {
    }
}
