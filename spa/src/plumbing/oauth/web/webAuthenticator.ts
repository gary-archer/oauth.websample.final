
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {Authenticator} from '../authenticator';
import {CognitoLogoutUrlBuilder} from './cognitoLogoutUrlBuilder';
import {CustomUserManager} from './customUserManager';
import {ExpireTokenClient} from './expireTokenClient';

/*
 * A custom web integration of OIDC Client, which uses cookies for token renewal
 */
export class WebAuthenticator implements Authenticator {

    // Our configuration settings
    private readonly _configuration: OAuthConfiguration;

    // The OIDC Client does all of the real security handling
    private readonly _userManager: CustomUserManager;

    // A class to prevent multiple UI views initiating the same OAuth operation at once
    private readonly _concurrencyHandler: ConcurrentActionHandler;

    /*
     * Initialise OAuth settings and create the OIDC Client UserManager object
     */
    public constructor(configuration: OAuthConfiguration) {

        this._userManager = new CustomUserManager(configuration);
        this._configuration = configuration;
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._setupCallbacks();
    }

    /*
     * Load and customise metadata, to route refresh token related requests via our reverse proxy
     */
    public async initialise(): Promise<void> {

        if (!this._userManager.settings.metadata) {
            await this._userManager.metadataService.getMetadata();
        }

        this._userManager.settings.metadata!.token_endpoint = `${this._configuration.reverseProxyUrl}/token`;
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
     * Try to refresh an access token via a cookie containing a refresh token
     */
    public async refreshAccessToken(): Promise<string> {

        // See if the user is logged in on any browser tab
        let user = await this._userManager.getUser();
        if (user) {

            try {

                // The concurrency handler will only do the refresh work for the first UI view that requests it
                await this._concurrencyHandler.execute(this._performTokenRefresh);

                // Return the renewed access token if possible
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

            // Handle Cognito logout specially
            if (this._configuration.authority.indexOf('cognito') !== -1) {

                // First remove tokens from memory
                await this._userManager.removeUser();

                // Do the redirect
                const builder = new CognitoLogoutUrlBuilder(this._configuration);
                const logoutRedirectUrl = builder.buildUrl();
                location.replace(logoutRedirectUrl);

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

        // First expire the access token so that the next API call returns a 401
        await this.expireAccessToken();

        // Next make token renewal fail also
        const client = new ExpireTokenClient();
        await client.expireRefreshToken(this._configuration);
    }

    /*
     * Ask OIDC client to silently renew the access token using a cookie
     */
    private async _performTokenRefresh() {

        try {

            // Call the OIDC Client method, which will send a refresh token grant message
            await this._userManager.signinSilent();

        } catch (e) {

            if (e.message === ErrorCodes.invalidGrant) {

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
