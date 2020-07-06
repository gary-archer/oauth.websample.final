import {Guid} from 'guid-typescript';
import {Authenticator} from '../authenticator';
import {MobileMethodCaller} from './mobileMethodCaller';

/*
 * An implementation that calls back the hosting mobile app
 */
export class MobileAuthenticator implements Authenticator {

    private _methodCaller: MobileMethodCaller;
    private _postLoginAction: () => void;

    public constructor(postLoginAction: () => void) {
        this._methodCaller = new MobileMethodCaller();
        this._postLoginAction = postLoginAction;
    }

    /*
     * Return true if there are tokens
     */
    public async isLoggedIn(): Promise<boolean> {
        const result = await this._methodCaller.callAsync('isLoggedIn');
        return result === 'true';
    }

    /*
     * Ask the mobile app for the current access token
     */
    public async getAccessToken(): Promise<string> {
        return this._methodCaller.callAsync('getAccessToken', Guid.create().toString());
    }

    /*
     * Ask the mobile app to use its refresh token to get a new access token
     */
    public async refreshAccessToken(): Promise<string> {
        return this._methodCaller.callAsync('refreshAccessToken', Guid.create().toString());
    }

    /*
     * Do the login operation, which does not involve redirecting the whole page
     */
    public async startLogin(returnLocation?: string): Promise<void> {

        // Ask the mobile side to do the work
        await this._methodCaller.callAsync('login');

        // Do post login navigation
        if (returnLocation) {
            location.hash = returnLocation;
        }

        // Run other post login actions
        this._postLoginAction();
    }

    /*
     * The method to handle a login response on page load is is a no op when running in a web view
     */
    public async handleLoginResponse(): Promise<void> {
    }

    /*
     * Initiate a logout redirect, which does not involve redirecting the whole page
     */
    public async startLogout(): Promise<void> {
        await this._methodCaller.callAsync('logout');
    }

    /*
     * For testing, make the access token act like it is expired
     */
    public async expireAccessToken(): Promise<void> {
        await this._methodCaller.callAsync('expireAccessToken');
    }

    /*
     * For testing, make the refresh token act like it is expired
     */
    public async expireRefreshToken(): Promise<void> {
        await this._methodCaller.callAsync('expireRefreshToken');
    }
}
