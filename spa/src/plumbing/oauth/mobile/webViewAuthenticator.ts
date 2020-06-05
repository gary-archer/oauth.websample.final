import {ErrorHandler} from '../../errors/errorHandler';
import {Authenticator} from '../authenticator';
import {MobilePromise} from './mobilePromise';

/*
 * An implementation that calls back the hosting mobile app
 */
export class WebViewAuthenticator implements Authenticator {

    // Global OAuth fields
    private readonly _mobileAuthenticator: any;
    private _isLoggedIn: boolean;

    /*
     * Store a reference to the object set in the web view on the mobile side
     */
    public constructor() {
        this._mobileAuthenticator = (window as any).mobileAuthenticator;
        this._isLoggedIn = false;
    }

    /*
     * Do initial setup
     */
    public async initialise(): Promise<void> {
        const accessToken = this._mobileAuthenticator.getAccessToken();
        this._isLoggedIn = !!accessToken;
    }

    /*
     * Return true if we have tokens
     */
    public isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    /*
     * Ask the mobile app for the current access token
     */
    public async getAccessToken(): Promise<string> {

        // Get the current token from the mobile app
        const accessToken = MobilePromise.callMobile(
            'getAccessToken',
            this._mobileAuthenticator.getAccessToken);

        // Return it if found
        if (accessToken) {
            return accessToken;
        }

        // Try to refresh the access token otherwise
        return this.refreshAccessToken();
    }

    /*
     * Ask the mobile app to use its refresh token to get a new access token
     */
    public async refreshAccessToken(): Promise<string> {
        
        const accessToken = this._mobileAuthenticator.refreshAccessToken();
        if (accessToken) {
            return accessToken;
        }
        
        throw ErrorHandler.getFromLoginRequired();
    }

    /*
     * Start a login redirect
     */
    public async startLogin(returnLocation?: string): Promise<void> {
        this._mobileAuthenticator.startLogin();
    }

    /*
     * This is a no op when running in a web view
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
