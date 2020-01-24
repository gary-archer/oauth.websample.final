import {UserManager, UserManagerSettings} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorHandler} from '../errors/errorHandler';
import {ErrorReporter} from '../errors/errorReporter';
import {Authenticator} from './authenticator';

/*
 * The entry point for initiating login and token requests
 */
export class OktaAuthenticator implements Authenticator {

    // The OIDC Client class does all of the real security processing
    private readonly _userManager: UserManager;

    /*
     * Initialise OAuth settings and create the UserManager
     */
    public constructor(configuration: OAuthConfiguration) {

        // For Okta we enable silent token renewal
        const settings = {
            authority: configuration.authority,
            client_id: configuration.clientId,
            redirect_uri: configuration.appUri,
            silent_redirect_uri: configuration.appUri,
            post_logout_redirect_uri: `${configuration.appUri}${configuration.postLogoutPath}`,
            scope: configuration.scope,
            response_type: 'code',
            loadUserInfo: false,
            automaticSilentRenew: true,
            monitorSession: false,
        } as UserManagerSettings;

        // Create the user manager
        this._userManager = new UserManager(settings);

        // Register for silent token renewal errors
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

        // Short circuit normal SPA page execution and do not try to render the view
        throw ErrorHandler.getFromLoginRequired();
    }

    /*
     * Trigger the login redirect
     */
    public async startLoginRedirect(): Promise<void> {

        // Store the SPA's client side location
        const data = {
            hash: location.hash.length > 0 ? location.hash : '#',
        };

        try {
            // Start a login redirect
            await this._userManager.signinRedirect({state: JSON.stringify(data)});

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromOAuthRequest(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle the response from the authorization server
     */
    public async handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            try {
                // Handle the login response
                const user = await this._userManager.signinRedirectCallback();

                // Get the hash URL before the redirect
                const data = JSON.parse(user.state);

                // Replace the browser location, to prevent tokens being available during back navigation
                history.replaceState({}, document.title, data.hash);

            } catch (e) {

                // Prevent back navigation problems after errors
                history.replaceState({}, document.title, '#');

                // Handle OAuth response errors
                throw ErrorHandler.getFromOAuthResponse(e, ErrorCodes.loginResponseFailed);
            }
        }
    }

    /*
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {

        const user = await this._userManager.getUser();
        if (user) {

            // Set the stored value to 60 seconds in the future so that OIDC Client does a token renewal shortly
            // Also corrupt the current token so that there is a 401 if it is sent to the API
            user.expires_at = Date.now() / 1000 + 60;
            user.access_token = 'x' + user.access_token + 'x';

            // Update OIDC so that it silently renews the token almost immediately
            // This demonstrates how a user does not have to login when a token expires
            this._userManager.storeUser(user);
            this._userManager.stopSilentRenew();
            this._userManager.startSilentRenew();
        }
    }

    /*
     * Redirect in order to log out at the authorization server and remove vendor cookies
     */
    public async startLogout(): Promise<void> {

        try {
            await this._userManager.signoutRedirect();
        } catch (e) {
            throw ErrorHandler.getFromOAuthRequest(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Clear the current access token from storage
     */
    public async clearAccessToken(): Promise<void> {
        await this._userManager.removeUser();
    }

    /*
     * Report any silent token renewal errors using the hidden iframe
     */
    private _onSilentTokenRenewalError(e: any): void {

        // A redirect with 'prompt=none' may return 'login_required', meaning the session expired
        if (e.error !== ErrorCodes.loginRequired) {

            // Other errors are real problems but are reported on the console, to avoid impacting users
            const error = ErrorHandler.getFromOAuthResponse(e, ErrorCodes.tokenRenewalIframeError);
            const reporter = new ErrorReporter();
            reporter.outputToConsole(error);
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
