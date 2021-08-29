import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {AccessTokenSupplier} from '../accessTokenSupplier';
import {OAuthFetch} from './oauthFetch';

/*
 * The web worker authenticator runs in a web worker and contains the access token for the current browser tab
 */
export class WebWorkerAuthenticator implements AccessTokenSupplier {

    private readonly _fetcher: OAuthFetch;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private _accessToken: string | null;
    private _antiForgeryToken: string | null;

    public constructor(configuration: OAuthConfiguration, sessionId: string) {

        this._fetcher = new OAuthFetch(configuration, sessionId);
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._accessToken = null;
        this._antiForgeryToken = null;
        this._setupCallbacks();
    }

    /*
     * Called from the ApiFetch class, which uses an instance of this class running in a web worker
     */
    public async getAccessToken(): Promise<string> {

        if (this._accessToken) {
            return this._accessToken;
        }

        return this.refreshAccessToken();
    }

    /*
     * Called from the ApiFetch class to refresh an access token in a synchronised manner across multiple views
     * The auth cookie is sent to the Proxy API, which returns an access token or an invalid_grant error
     */
    public async refreshAccessToken(): Promise<string> {

        if (this._antiForgeryToken) {

            await this._concurrencyHandler.execute(this._performTokenRefresh);
            if (this._accessToken) {
                return this._accessToken;
            }
        }

        throw ErrorHandler.getFromLoginRequired();
    }

    /*
     * Receive the result of a page load from the main side of the app
     */
    public onPageLoad(antiForgeryToken: string): void {
        this._antiForgeryToken = antiForgeryToken;
    }

    /*
     * Clear the access token when requested by the main side of the app
     */
    public onClearAccessToken(): void {
        this._accessToken = null;
    }

    /*
     * Clean up when requested by the main side of the app
     */
    public onLogout(): void {

        this._accessToken = null;
        this._antiForgeryToken = null;
    }

    /*
     * This method is for testing only, to make the access token receive a 401 response from the API
     */
    public onExpireAccessToken(): void {

        if (this._accessToken) {
            this._accessToken = `x${this._accessToken}x`;
        }
    }

    /*
     * Do the work of getting an access token by sending an auth cookie containing a refresh token
     * Expected errors fall through to the calling function and result in redirecting the user to re-authenticate
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            this._accessToken = null;
            const response = await this._fetcher.execute('POST', '/token', this._antiForgeryToken, null);
            this._accessToken = response.accessToken;

        } catch (e) {

            if (!this._isExpectedTokenRefreshError(e)) {
                throw ErrorHandler.getFromTokenRefreshError(e);
            }
        }
    }

    /*
     * Check for errors that mean the session is expired normally
     */
    private _isExpectedTokenRefreshError(error: any): boolean {

        return error.statusCode === 400 &&
               (error.errorCode === ErrorCodes.cookieNotFound ||
                error.errorCode === ErrorCodes.invalidData    ||
                error.errorCode === ErrorCodes.invalidGrant);
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._performTokenRefresh = this._performTokenRefresh.bind(this);
    }
}
