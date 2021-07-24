import {Guid} from 'guid-typescript';
import {AccessTokenSupplier} from '../accessTokenSupplier';
import {Authenticator} from '../authenticator';
import {MobileMethodCaller} from './mobileMethodCaller';

/*
 * Used when the SPA is running in a mobile web view and getting its access tokens from the mobile app
 */
export class MobileAuthenticator implements Authenticator, AccessTokenSupplier {

    private _methodCaller: MobileMethodCaller;

    public constructor() {
        this._methodCaller = new MobileMethodCaller();
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

        // TODO: Need to call this after a login
        // this._onReloadData(false);
    }

    /*
     * This is a no op when the SPA is running in a mobile web view
     */
    public async handlePageLoad(): Promise<boolean> {
        return false;
    }

    /*
     * Initiate a logout redirect, which does not involve redirecting the whole page
     */
    public async logout(): Promise<void> {
        await this._methodCaller.callAsync('logout');
    }

    /*
     * This is a no op when the SPA is running in a mobile web view
     */
    public async onLoggedOut(): Promise<void> {
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
