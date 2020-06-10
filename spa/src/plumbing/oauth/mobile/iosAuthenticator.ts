import {Guid} from 'guid-typescript';
import {Authenticator} from '../authenticator';
import {IosMethod} from './iosMethod';

/*
 * An implementation that calls back the hosting iOS app
 */
export class IosAuthenticator implements Authenticator {

    private _isLoggedIn: boolean;
    private _postLoginAction: () => void;

    public constructor(postLoginAction: () => void) {
        this._isLoggedIn = false;
        this._postLoginAction = postLoginAction;
    }

    /*
     * Make an initial async request to get the logged in state
     */
    public async initialise(): Promise<void> {
        const result = await IosMethod.callAsync('isLoggedIn');
        this._isLoggedIn = result === 'true';
    }

    /*
     * A synchronous method that ReactJS can bind to when updating the UI based on logged in state
     */
    public isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    /*
     * Ask the mobile app for the current access token
     */
    public async getAccessToken(): Promise<string> {
        return await IosMethod.callAsync('getAccessToken', Guid.create().toString());
    }

    /*
     * Ask the mobile app to use its refresh token to get a new access token
     */
    public async refreshAccessToken(): Promise<string> {
        return await IosMethod.callAsync('refreshAccessToken', Guid.create().toString());
    }

    /*
     * Do the login operation, which does not involve redirecting the whole page
     */
    public async startLogin(returnLocation?: string): Promise<void> {

        throw new Error('Login is not implemented yet');

        /*
        // Ask the mobile side to do the work
        await IosMethod.callAsync('startLogin');

        // Navigate away from login required
        if (location.hash.indexOf('loggedout') !== -1) {
            location.hash = '#'
        }

        // Run post login actions
        this._isLoggedIn = true;
        this._postLoginAction();*/
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
        await IosMethod.callAsync('startLogout');
        this._isLoggedIn = false;
    }

    /*
     * For testing, make the access token act like it is expired
     */
    public async expireAccessToken(): Promise<void> {
        await IosMethod.callAsync('expireAccessToken');
    }

    /*
     * For testing, make the refresh token act like it is expired
     */
    public async expireRefreshToken(): Promise<void> {
        await IosMethod.callAsync('expireRefreshToken');
    }
}
