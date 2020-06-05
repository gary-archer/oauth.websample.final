import {UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {Authenticator} from '../authenticator';
import {CognitoWebStorage} from './cognitoWebStorage';

/*
 * Cognito specific implementation
 */
export class CognitoAuthenticator implements Authenticator {

    // Global OAuth fields
    private readonly _userManager: UserManager;
    private readonly _configuration: OAuthConfiguration;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private _isLoggedIn: boolean;

    /*
     * Initialise OAuth settings and create the OIDC Client UserManager object
     */
    public constructor(configuration: OAuthConfiguration) {

        // Cognito settings use customised session storage
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

        // Initialise state
        this._userManager = new UserManager(settings);
        this._configuration = configuration;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._isLoggedIn = false;
        this._setupCallbacks();
    }

    /*
     * Set the logged in state at startup or if the user refreshes the page
     */
    public async initialise(): Promise<void> {
        const user = await this._userManager.getUser();
        this._isLoggedIn = !!user;
    }

    /*
     * Return a denormalised flag synchronously to simplify React state and avoid duplication
     */
    public isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    /*
     * Get an access token if possible, which will retrieve it from storage
     */
    public async getAccessToken(): Promise<string> {

        // Get tokens from OIDC client
        const user = await this._userManager.getUser();
        if (user && user.access_token) {
            return user.access_token;
        }

        // Try to refresh the access token otherwise
        return this.refreshAccessToken();
    }

    /*
     * Try to refresh an access token
     */
    public async refreshAccessToken(): Promise<string> {

        let user = await this._userManager.getUser();
        if (user && user.refresh_token) {

            try {

                // Refresh the access token via a refresh token grant message
                // The concurrency handler will only do the refresh work for the first UI view that requests it
                await this._concurrencyHandler.execute(this._performTokenRefresh);

                // Return the renewed access token
                user = await this._userManager.getUser();
                if (user && user.access_token) {
                    return user.access_token;
                }

            } catch (e) {

                // Rethrow errors
                throw e;
            }
        }

        // Trigger a login redirect if there are no unexpected errors but we cannot refresh
        throw ErrorHandler.getFromLoginRequired();
    }

    /*
     * Trigger the login redirect
     */
    public async startLogin(returnLocation?: string): Promise<void> {

        // Store the SPA's location
        let hash = returnLocation;
        if (!hash) {
            hash = location.hash;
        }
        const data = {
            hash,
        };

        try {
            // Start a login redirect
            await this._userManager.signinRedirect({state: JSON.stringify(data)});

            // Short circuit normal SPA page execution and do not try to render the view
            throw ErrorHandler.getFromLoginRequired();

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromLoginRequest(e, ErrorCodes.loginRequestFailed);
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

                // Update state returned synchronously to React
                this._isLoggedIn = true;

            } catch (e) {

                // Prevent back navigation problems after errors
                history.replaceState({}, document.title, '#');

                // Handle OAuth response errors
                throw ErrorHandler.getFromLoginResponse(e, ErrorCodes.loginResponseFailed);
            }
        }
    }

    /*
     * Implement the bespoke Cognito redirect to log out at the authorization server
     * https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
     */
    public async startLogout(): Promise<void> {

        try {
            // First update state
            await this._userManager.removeUser();
            this._isLoggedIn = false;

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
            throw ErrorHandler.getFromLogoutRequest(e, ErrorCodes.logoutRequestFailed);
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
     * Ask OIDC client to silently renew the access token using the Cognito refresh token
     */
    private async _performTokenRefresh() {

        try {

            // Call the OIDC Client method
            await this._userManager.signinSilent();

        } catch (e) {

            // For invalid_grant errors, clear token data and return success, to force a login redirect
            if (e.message === ErrorCodes.refreshTokenExpired) {

                await this._userManager.removeUser();
                this._isLoggedIn = false;
            }
            else {

                // Rethrow other errors
                throw ErrorHandler.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            }
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._performTokenRefresh = this._performTokenRefresh.bind(this);
    }
}
