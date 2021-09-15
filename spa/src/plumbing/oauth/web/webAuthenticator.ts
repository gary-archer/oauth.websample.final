import {AxiosRequestConfig} from 'axios';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {UIError} from '../../errors/uiError';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {Authenticator} from '../authenticator';
import {CredentialSupplier} from '../credentialSupplier';
import {OAuthFetch} from './oauthFetch';

/*
 * An authenticator class that runs on the main side of the app in a desktop browser
 */
export class WebAuthenticator implements Authenticator, CredentialSupplier {

    private readonly _fetcher: OAuthFetch;
    private _antiForgeryToken: string | null;
    private readonly _concurrencyHandler: ConcurrentActionHandler;

    public constructor(configuration: OAuthConfiguration, sessionId: string) {

        this._fetcher = new OAuthFetch(configuration, sessionId);
        this._antiForgeryToken = null;
        this._concurrencyHandler = new ConcurrentActionHandler();
    }

    /*
     * Trigger the login redirect to the Authorization Server
     */
    public async login(): Promise<void> {

        try {

            // Call the API to set up the login
            const response = await this._fetcher.execute('POST', '/login/start', this._antiForgeryToken, null);

            // Store the app location and other state if required
            HtmlStorageHelper.appState = {
                hash: location.hash || '#',
            };

            // Then do the redirect
            location.href = response.authorizationRequestUri;

        } catch (e) {

            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Check for and handle login responses when the page loads
     */
    public async handlePageLoad(): Promise<boolean> {

        let appLocation = '#';
        try {

            // Send the full URL to the proxy API
            const request = {
                url: location.href,
            };
            const response = await this._fetcher.execute('POST', '/login/end', this._antiForgeryToken, request);

            // If it was handled it was an Authorization response and the SPA may need to perform actions
            if (response.handled) {

                // Get the location before the redirect
                const appState = HtmlStorageHelper.appState;
                if (appState) {
                    appLocation = appState.hash;
                }

                // Remove session storage and the OAuth details from back navigation
                HtmlStorageHelper.removeAppState();
                history.replaceState({}, document.title, appLocation);
            }

            // Store the anti forgery token here, where it is used for OAuth requests
            if (response.antiForgeryToken) {
                this._antiForgeryToken = response.antiForgeryToken;
            }

            // Return the logged in state
            return response.isLoggedIn;

        } catch (e) {

            // See if this is an OAuth response error as opposed to a general HTTP problem
            const uiError = e as UIError;
            if (uiError && uiError.errorCode === ErrorCodes.loginResponseFailed) {

                // Remove the code / error details from the browser and back navigation
                history.replaceState({}, document.title, appLocation);
            }

            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);
        }
    }

    /*
     * Do the logout redirect to clear all cookie and token details
     */
    public async logout(): Promise<void> {

        try {

            const response = await this._fetcher.execute('POST', '/logout', this._antiForgeryToken, null);
            location.href = response.endSessionRequestUri;

        } catch (e) {

            throw ErrorHandler.getFromLogoutOperation(e, ErrorCodes.logoutRequestFailed);

        } finally {

            this._antiForgeryToken = null;
        }
    }

    /*
     * When a logout occurs on another browser tab, move this tab to a logged out state
     */
    public async onLoggedOut(): Promise<void> {
        this._antiForgeryToken = null;
    }

    /*
     * This method is for testing only, so that the SPA can receive expired access token responses
     */
    public async expireAccessToken(): Promise<void> {
        await this._fetcher.execute('POST', '/expire', this._antiForgeryToken, {type: 'access'});
    }

    /*
     * This method is for testing only, so that the SPA can receive expired refresh token responses
     */
    public async expireRefreshToken(): Promise<void> {
        await this._fetcher.execute('POST', '/expire', this._antiForgeryToken, {type: 'refresh'});
    }

    /*
     * When calling an API we may need to ask
     */
    public async onCallApi(options: AxiosRequestConfig, isRetry: boolean): Promise<void> {

        // If there is no anti forgery token then the user must sign in
        if (!this._antiForgeryToken) {
            throw ErrorHandler.getFromLoginRequired();
        }

        // Ensure that the secure cookie is sent
        options.withCredentials = true;

        // If retrying an API call, ask the back end for front end API to rewrite the cookie
        if (isRetry) {
            await this._concurrencyHandler.execute(this._performTokenRefresh);
        }
    }

    /*
     * Do the work of getting an access token by sending an auth cookie containing a refresh token
     * Expected errors fall through to the calling function and result in redirecting the user to re-authenticate
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            await this._fetcher.execute('POST', '/refresh', this._antiForgeryToken, null);

        } catch (e) {

            if (this._isSessionExpiredError(e)) {
                throw ErrorHandler.getFromLoginRequired();
            }

            throw ErrorHandler.getFromTokenRefreshError(e);
        }
    }

    /*
     * Check for errors that mean the session is expired normally
     */
    private _isSessionExpiredError(error: any): boolean {

        return error.statusCode === 400 &&
               (error.errorCode === ErrorCodes.cookieNotFound ||
                error.errorCode === ErrorCodes.invalidData    ||
                error.errorCode === ErrorCodes.invalidGrant);
    }
}
