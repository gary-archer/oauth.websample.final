import * as Oidc from 'oidc-client';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorHandler} from '../errors/errorHandler';
import {UrlHelper} from '../utilities/urlHelper';

/*
 * The entry point for initiating login and token requests
 */
export class Authenticator {

    // Used to report silent token renewal errors back to the UI
    private static _errorCallback: (error: any) => void;

    // The OIDC Client class does all of the real security processing
    private readonly _userManager: Oidc.UserManager;

    /*
     * OIDC Client setup
     */
    public constructor(config: OAuthConfiguration, errorCallback: (error: any) => void) {

        // A callback for rendering silent token renewal errors
        Authenticator._errorCallback = errorCallback;

        // Create OIDC settings from our application configuration
        const settings = {
            authority: config.authority,
            client_id: config.clientId,
            redirect_uri: config.appUri,
            silent_redirect_uri: config.appUri,
            post_logout_redirect_uri: `${config.appUri}${config.postLogoutPath}`,
            scope: config.scope,

            // Use the Authorization Code Flow
            response_type: 'code',

            // We will silently renew tokens on a hidden iframe
            automaticSilentRenew: true,

            // Disable these features which we are not using
            loadUserInfo: false,
            monitorSession: false,

        } as Oidc.UserManagerSettings;

        // Create the user manager
        this._userManager = new Oidc.UserManager(settings);
        this._userManager.events.addSilentRenewError(this._onSilentTokenRenewalError);
        this._setupCallbacks();
    }

    /*
     * Get an access token and login if required
     */
    public async getAccessToken(): Promise<string> {

        // On most calls we just return the existing token from HTML5 storage
        const user = await this._userManager.getUser();
        if (user && user.access_token && user.access_token.length > 0) {
            return user.access_token;
        }

        // Store the SPA's client side location
        const data = {
            hash: location.hash.length > 0 ? location.hash : '#',
        };

        try {
            // Start a login redirect
            await this._userManager.signinRedirect({state: JSON.stringify(data)});

            // Short circuit normal SPA page execution and do not try to render the view
            throw ErrorHandler.getFromLoginRequired();

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromOAuthRequest(e, 'login_request_failed');
        }
    }

    /*
     * Handle the response from the authorization server
     */
    public async handleLoginResponse(): Promise<boolean> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const query = UrlHelper.getLocationQueryData();
        if (!query.state) {
            return true;
        }

        // See if this is the main window
        if (window.top === window.self) {
            try {
                // Handle the response
                const user = await this._userManager.signinRedirectCallback();

                // Get the hash URL before the redirect
                const data = JSON.parse(user.state);

                // Replace the browser location, to prevent tokens being available during back navigation
                history.replaceState({}, document.title, data.hash);
                return true;

            } catch (e) {

                // Prevent back navigation problems after errors
                history.replaceState({}, document.title, '#');

                // Handle OAuth response errors
                throw ErrorHandler.getFromOAuthResponse(e, 'login_response_failed');
            }
        } else {

            // Handle silent token renewal responses and note that errors are raised via an OIDC event
            await this._userManager.signinSilentCallback();

            // Always short circuit main page execution on the renewal iframe
            return false;
        }
    }

    /*
     * Redirect in order to log out at the authorization server and remove vendor cookies
     */
    public async startLogout(): Promise<void> {

        try {
            await this._userManager.signoutRedirect();
        } catch (e) {
            throw ErrorHandler.getFromOAuthRequest(e, 'logout_request_failed');
        }
    }

    /*
     * Clear the current access token from storage to force a login
     */
    public async clearAccessToken(): Promise<void> {

        await this._userManager.removeUser();
    }

    /*
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {

        const user = await this._userManager.getUser();
        if (user) {

            // Set the stored value to 60 minutes in the future so that OIDC Client does a token renewal shortly
            // Also corrupt the current token so that there is a 401 if it is sent to the API
            user.expires_at = Date.now() / 1000 + 60;
            user.access_token = 'x' + user.access_token + 'x';

            // Update OIDC so that it silently renews the token almost immediately
            this._userManager.storeUser(user);
            this._userManager.stopSilentRenew();
            this._userManager.startSilentRenew();
        }
    }

    /*
     * Report any silent token renewal errors
     */
    private _onSilentTokenRenewalError(e: any): void {

        // A redirect with 'prompt=none' may return 'login_required', meaning the session expired
        if (e.error !== 'login_required') {

            // Other errors are real problems and are reported
            const error = ErrorHandler.getFromOAuthResponse(e, 'background');
            Authenticator._errorCallback(error);
        }
    }

            /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.clearAccessToken = this.clearAccessToken.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this._onSilentTokenRenewalError = this._onSilentTokenRenewalError.bind(this);
   }
}
