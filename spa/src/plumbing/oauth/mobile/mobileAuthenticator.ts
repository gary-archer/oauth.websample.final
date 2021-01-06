import {Guid} from 'guid-typescript';
import {Authenticator} from '../authenticator';
import {MobileMethodCaller} from './mobileMethodCaller';

/*
 * An implementation that calls back the hosting mobile app
 */
export class MobileAuthenticator implements Authenticator {

    private _methodCaller: MobileMethodCaller;
    private _onLoggedInAction: () => void;

    public constructor(_onLoggedInAction: () => void) {
        this._methodCaller = new MobileMethodCaller();
        this._onLoggedInAction = _onLoggedInAction;
    }

    /*
     * This is a no op in the mobile case
     */
    public async initialise(): Promise<void> {
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
    public async login(): Promise<void> {

        // Do the login work in the mobile app
        await this._methodCaller.callAsync('login');

        // Run other post login actions
        this._onLoggedInAction();
    }

    /*
     * The method to handle a login response on page load is is a no op when running in a web view
     */
    public async handleLoginResponse(): Promise<void> {
    }

    /*
     * Initiate a logout redirect, which does not involve redirecting the whole page
     */
    public async logout(): Promise<void> {
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
