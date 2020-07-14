import {UserManager, WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {Authenticator} from '../authenticator';
import {MemoryTokenStorage} from './memoryTokenStorage';

/*
 * A custom web integration of OIDC Client, which uses cookies for token renewal
 */
export class WebAuthenticator implements Authenticator {

    // Our configuration settings
    private readonly _configuration: OAuthConfiguration;

    // The OIDC Client does all of the real security handling
    private readonly _userManager: UserManager;

    // A class to prevent multiple UI views initiating the same OAuth operation at once
    private readonly _concurrencyHandler: ConcurrentActionHandler;

    /*
     * Initialise OAuth settings and create the OIDC Client UserManager object
     */
    public constructor(configuration: OAuthConfiguration) {

        const settings = {

            // The Open Id Connect base URL
            authority: configuration.authority,

            // Basic settings
            client_id: configuration.clientId,
            redirect_uri: configuration.appUri,
            scope: configuration.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // We use a proxying cookie based solution to refresh access tokens
            automaticSilentRenew: false,

            // We get extended user info from our API and do not use this feature
            loadUserInfo: false,

            // Indicate the post logout return location
            post_logout_redirect_uri: `${configuration.appUri}${configuration.postLogoutPath}`,

            // Tokens are stored only in memory, as recommended for security reasons
            // https://auth0.com/docs/tokens/guides/store-tokens
            userStore: new WebStorageStateStore({ store: new MemoryTokenStorage() })
        };

        // Initialise state
        this._userManager = new UserManager(settings);
        this._configuration = configuration;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._setupCallbacks();
    }

    /*
     * Load and customise metadata, to route token requests via our reverse proxy
     */
    public async initialise(): Promise<void> {

        if (!this._userManager.settings.metadata) {
            await this._userManager.metadataService.getMetadata();
        }

        this._userManager.settings.metadata!.token_endpoint = this._configuration.tokenEndpoint;
    }

    /*
     * Return true if there are tokens
     */
    public async isLoggedIn(): Promise<boolean> {
        const user = await this._userManager.getUser();
        return !!user;
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
     * Try to refresh an access token via a refresh token grant message based on cookies
     */
    public async refreshAccessToken(): Promise<string> {

        let user = await this._userManager.getUser();
        if (user && user.refresh_token) {

            try {

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

            let redirectLocation = '#';
            try {

                // Only try to process a login response if the state exists
                const storedState = await this._userManager.settings.stateStore?.get(urlData.query.state);
                if (storedState) {

                    // Process the login response and send the authorization code grant message
                    const user = await this._userManager.signinRedirectCallback();

                    // Get the hash URL before the login redirect
                    const data = JSON.parse(user.state);
                    redirectLocation = data.hash;
                }

            } catch (e) {

                // Handle and rethrow OAuth response errors
                throw ErrorHandler.getFromLoginResponse(e, ErrorCodes.loginResponseFailed);

            } finally {

                // Always replace the browser location, to remove OAuth details from back navigation
                history.replaceState({}, document.title, redirectLocation);
            }
        }
    }

    /*
     * Do the logout redirect
     */
    public async startLogout(): Promise<void> {

        try {

            // Cognito has a vendor specific logout solution
            // https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
            if (this._configuration.authority.indexOf('cognito') === -1) {

                // First update state
                await this._userManager.removeUser();

                // Cognito requires the configured logout return URL to use a path segment
                // Therefore we configure https://web.authguidance-examples.com/spa/loggedout.html
                const logoutReturnUri = encodeURIComponent(`${this._configuration.appUri}loggedout.html`);

                // We then use the above URL in the logout redirect request
                // Upon return, loggedout.html redirects to https://web.authguidance-examples.com/spa/#/loggedout
                let url = `${this._configuration.logoutEndpoint}`;
                url += `?client_id=${this._configuration.clientId}&logout_uri=${logoutReturnUri}`;
                location.replace(url);

            } else {

                // Otherwise do a standards based logout redirect
                await this._userManager.signoutRedirect();
            }

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

            user.access_token = 'x' + user.access_token + 'x';
            this._userManager.storeUser(user);
        }
    }

    /*
     * For testing, make the refresh token act like it is expired
     */
    public async expireRefreshToken(): Promise<void> {
    }

    /*
     * Ask OIDC client to silently renew the access token using a cookie
     */
    private async _performTokenRefresh() {

        try {

            // Call the OIDC Client method to use the dummy refresh token
            await this._userManager.signinSilent();

        } catch (e) {

            if (e.message === ErrorCodes.refreshTokenExpired) {

                // For invalid_grant errors, clear token data and return success, to force a login redirect
                await this._userManager.removeUser();
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
