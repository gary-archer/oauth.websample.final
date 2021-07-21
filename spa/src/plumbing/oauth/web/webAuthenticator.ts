import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {UIError} from '../../errors/uiError';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {Authenticator} from '../authenticator';
import {OAuthFetch} from './oauthFetch';
import {WebAuthenticatorEvents} from './webAuthenticatorEvents';

/*
 * An authenticator class that runs on the main side of the app in a desktop browser
 */
export class WebAuthenticator implements Authenticator {

    private readonly _fetcher: OAuthFetch;
    private readonly _events: WebAuthenticatorEvents;
    private _antiForgeryToken: string | null;

    public constructor(configuration: OAuthConfiguration, sessionId: string, events: WebAuthenticatorEvents) {

        this._fetcher = new OAuthFetch(configuration, sessionId);
        this._events = events;
        this._antiForgeryToken = null;
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
    public async handlePageLoad(): Promise<void> {

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

            // Store the anti forgery token both here and in the web worker, where it is used to refresh tokens
            if (response.antiForgeryToken) {
                this._antiForgeryToken = response.antiForgeryToken;
                this._events.onPageLoad(response.antiForgeryToken);
            }

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

            const response = await this._fetcher.execute('POST', '/logout/start', this._antiForgeryToken, null);
            location.href = response.endSessionRequestUri;

        } catch (e) {

            throw ErrorHandler.getFromLogoutOperation(e, ErrorCodes.logoutRequestFailed);

        } finally {

            await this._events.onLogout();
        }
    }

    /*
     * This method is for testing only, to make the access token receive a 401 response from the API
     */
    public async expireAccessToken(): Promise<void> {
        await this._events.onExpireAccessToken();
    }

    /*
     * This method is for testing only, to ask the Proxy API to invalidate the refresh token in the auth cookie
     */
    public async expireRefreshToken(): Promise<void> {

        await this._events.onClearAccessToken();
        await this._fetcher.execute('POST', '/token/expire', this._antiForgeryToken, null);
    }
}
