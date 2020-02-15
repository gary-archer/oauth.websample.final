import {UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorHandler} from '../errors/errorHandler';
import {Authenticator} from './authenticator';
import {CognitoWebStorage} from './cognitoWebStorage';

/*
 * Cognito specific implementation
 */
export class CognitoAuthenticator implements Authenticator {

    // The OIDC Client class does all of the real security processing
    private readonly _userManager: UserManager;
    private readonly _configuration: OAuthConfiguration;

    /*
     * Initialise OAuth settings and create the UserManager
     */
    public constructor(configuration: OAuthConfiguration) {

        // For Cognito we disable silent token renewal on an iframe and use HTML
        const settings = {
            authority: configuration.authority,
            client_id: configuration.clientId,
            redirect_uri: configuration.appUri,
            scope: configuration.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // We are not using background silent token renewal
            automaticSilentRenew: false,

            // We are not using these features and we get extended user info from our API
            loadUserInfo: false,
            monitorSession: false,

            // Use custom storage to work around Cognito problems
            userStore: new WebStorageStateStore({ store: new CognitoWebStorage() }),

        } as UserManagerSettings;

        // Create the user manager
        this._userManager = new UserManager(settings);
        this._configuration = configuration;
        this._setupCallbacks();
    }

    /*
     * Get an access token and login if required
     */
    public async getAccessToken(): Promise<string> {

        // On most calls we just return the existing token from HTML5 storage
        let user = await this._userManager.getUser();
        if (user && user.access_token && user.access_token.length > 0) {
            return user.access_token;
        }

        // Try to refresh the access token
        if (user && user.refresh_token && user.refresh_token.length > 0) {

            try {
                // Ask OIDC client to silently renew using the refresh token
                user = await this._userManager.signinSilent();

                // Return the renewed access token
                if (user && user.access_token && user.access_token.length > 0) {
                    return user.access_token;
                }

            } catch (e) {

                // Invalid grant means the refresh token has expired, in which case we will fall through and login
                if (e.message !== ErrorCodes.refreshTokenExpired) {
                    throw e;
                }
            }
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

            // Short circuit normal SPA page execution and do not try to render the view
            throw ErrorHandler.getFromLoginRequired();

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromOAuthRequest(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle login responses on the main window
     */
    public async handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            try {
                // Handle the response
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

            // This will cause the next call to the API to return 401
            user.access_token = 'x' + user.access_token + 'x';
            this._userManager.storeUser(user);
        }
    }

    /*
     * Implement the bespoke Cognito redirect to log out at the authorization server
     * https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
     */
    public async startLogout(): Promise<void> {

        try {
            // First clear all tokens from session storage
            await this._userManager.removeUser();

            // Cognito requires the configured logout return URL to use a path segment
            // Therefore we configure https://web.authguidance-examples.com/spa/loggedout.html
            const logoutReturnUri = encodeURIComponent(
                `${this._configuration.appUri}${this._configuration.postLogoutPath}.html`);

            // We then use the above URL in the logout redirect request
            // Upon return, loggedout.html redirects to https://web.authguidance-examples.com/spa/#loggedout
            let url = `${this._configuration.logoutEndpoint}`;
            url += `?client_id=${this._configuration.clientId}&logout_uri=${logoutReturnUri}`;
            location.replace(url);

        } catch (e) {
            throw ErrorHandler.getFromOAuthRequest(e, ErrorCodes.logoutRequestFailed);
        }
    }

    /*
     * Clear the current access token from storage
     */
    public async clearAccessToken(): Promise<void> {

        const user = await this._userManager.getUser();
        if (user) {
            user.access_token = '';
            this._userManager.storeUser(user);
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.clearAccessToken = this.clearAccessToken.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
   }
}
