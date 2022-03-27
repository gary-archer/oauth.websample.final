import {AxiosRequestConfig} from 'axios';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorFactory} from '../../errors/errorFactory';
import {UIError} from '../../errors/uiError';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {Authenticator} from '../authenticator';
import {CredentialSupplier} from '../credentialSupplier';
import {OAuthFetch} from './oauthFetch';
import {PageLoadResponse} from './pageLoadResponse';

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
        this._setupCallbacks();
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
                path: location.href || '/',
            };

            // Then do the redirect
            location.href = response.authorizationRequestUri;

        } catch (e) {

            throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Check for and handle login responses when the page loads
     */
    public async handlePageLoad(): Promise<boolean> {

        let appLocation = '#';
        let isLoggedIn = false;

        try {

            // Send the full URL to the Token Handler API
            const request = {
                url: location.href,
            };
            const pageLoadResponse = await this._fetcher.execute(
                'POST',
                '/login/end',
                this._antiForgeryToken, request) as PageLoadResponse;

            // If it was handled it was an Authorization response and the SPA may need to perform actions
            if (pageLoadResponse.handled) {

                // Get the location before the redirect
                const appState = HtmlStorageHelper.appState;
                if (appState) {
                    appLocation = appState.path;
                }

                // Remove session storage
                HtmlStorageHelper.removeAppState();

                // Remove OAuth details from the browser URL and back navigation
                history.replaceState({}, document.title, appLocation);
            }

            // Store the anti forgery token here, where it is used for OAuth requests
            if (pageLoadResponse.antiForgeryToken) {
                this._antiForgeryToken = pageLoadResponse.antiForgeryToken;
            }

            // Return the logged in state to the rest of the app
            isLoggedIn = pageLoadResponse.isLoggedIn;

        } catch (e: any) {

            // Ensure that any OAuth details are removed from the browser URL and back navigation
            history.replaceState({}, document.title, appLocation);

            // Report unexpected errors
            if (!this._isTokenHandlerAccessDeniedError(e)) {
                throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginResponseFailed);
            }

            // Access denied errors are expected occasionally, and result in a new user login
        }

        return isLoggedIn;
    }

    /*
     * Do the logout redirect to clear all cookie and token details
     */
    public async logout(): Promise<void> {

        try {

            const response = await this._fetcher.execute('POST', '/logout', this._antiForgeryToken, null);
            location.href = response.endSessionRequestUri;

        } catch (e) {

            throw ErrorFactory.fromLogoutOperation(e, ErrorCodes.logoutRequestFailed);

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
     * Deal with supplying or renewing credentials when calling an API
     */
    public async onCallApi(options: AxiosRequestConfig, isRetry: boolean): Promise<void> {

        // If there is no anti forgery token then the user must sign in
        if (!this._antiForgeryToken) {
            throw ErrorFactory.fromLoginRequired();
        }

        // Send the secure cookie and also the anti forgery token, which is used on data changing commands
        options.withCredentials = true;
        options.headers!['x-mycompany-csrf'] = this._antiForgeryToken;

        // If retrying an API call, ask the back end for front end API to rewrite the cookie
        if (isRetry) {
            await this._concurrencyHandler.execute(this._performTokenRefresh);
        }
    }

    /*
     * Do the work of asking the token handler API to refresh the access token stored in the secure cookie
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            await this._fetcher.execute('POST', '/refresh', this._antiForgeryToken, null);

        } catch (e: any) {

            if (e.statusCode === 401) {
                throw ErrorFactory.fromLoginRequired();
            }

            throw ErrorFactory.fromTokenRefreshError(e);
        }
    }

    /*
     * When page load requests fail due to invalid cookies the token handler returns a generic 401 error
     * This could be caused by a new cookie encryption key or a redeployment of the Authorization Server
     */
    private _isTokenHandlerAccessDeniedError(e: any): boolean {

        const uiError = e as UIError;
        return uiError.statusCode === 401 && uiError.errorCode === ErrorCodes.accessDeniedError;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._performTokenRefresh = this._performTokenRefresh.bind(this);
    }
}
