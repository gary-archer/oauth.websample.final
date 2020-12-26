
import {WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {UrlHelper} from '../../utilities/urlHelper';
import {Authenticator} from '../authenticator';
import {CustomUserManager} from './customUserManager';
import {HybridTokenStorage} from './hybridTokenStorage';

/*
 * A custom web integration of OIDC Client, which uses cookies for token renewal
 */
export class WebAuthenticator implements Authenticator {

    // Our OAuth configuration
    private readonly _configuration: OAuthConfiguration;

    // The OIDC Client does all of the real security handling
    private readonly _userManager: CustomUserManager;

    // Tokens are stored only in memory, but we store multi tab state in local storage
    private readonly _tokenStorage: HybridTokenStorage;

    // A class to prevent multiple UI views initiating the same OAuth operation at once
    private readonly _concurrencyHandler: ConcurrentActionHandler;

    /*
     * Initialise OAuth settings and create the OIDC Client UserManager object
     */
    public constructor(webBaseUrl: string, configuration: OAuthConfiguration) {

        this._tokenStorage = new HybridTokenStorage();
        const userManagerSettings = {

            // The Open Id Connect base URL
            authority: configuration.authority,

            // Core OAuth settings for our app
            client_id: configuration.clientId,
            redirect_uri: UrlHelper.append(webBaseUrl, configuration.redirectUri),
            scope: configuration.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // We use a proxying cookie based solution to refresh access tokens
            automaticSilentRenew: false,

            // We do not use these features
            monitorSession: false,
            loadUserInfo: false,

            // Store tokens in memory and multi tab state in local storage
            userStore: new WebStorageStateStore({ store: this._tokenStorage }),

            // Indicate the path in our app to return to after logout
            post_logout_redirect_uri: UrlHelper.append(webBaseUrl, configuration.postLogoutRedirectUri),
        };

        this._configuration = configuration;
        this._userManager = new CustomUserManager(webBaseUrl, configuration, this._tokenStorage, userManagerSettings);
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._setupCallbacks();
    }

    /*
     * Do custom initialisation of our user manager class
     */
    public async initialise(): Promise<void> {
        await this._userManager.initialise();
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
        return await this.refreshAccessToken();
    }

    /*
     * Try to refresh an access token via a cookie containing a refresh token
     */
    public async refreshAccessToken(): Promise<string> {

        // See if the user is stored on any browser tab
        let user = await this._userManager.getUser();
        if (user) {

            // The concurrency handler will only do the refresh work for the first UI view that requests it
            await this._concurrencyHandler.execute(this._performTokenRefresh);

            // Return the renewed access token if possible
            user = await this._userManager.getUser();
            if (user && user.access_token) {
                return user.access_token;
            }
        }

        // Trigger a login redirect if there are no unexpected errors but we cannot refresh
        throw ErrorHandler.getFromLoginRequired();
    }

    /*
     * Trigger the login redirect
     */
    public async startLogin(returnLocation?: string): Promise<void> {

        try {

            // Get the SPA's location
            let hash = returnLocation;
            if (!hash) {
                hash = location.hash;
            }

            // Get the identity provider to use or default to unknown
            const idp = this._getRuntimeIdentityProvider();
            const extraQueryParams: any = {};
            if (idp) {
                extraQueryParams[this._configuration.idpParameterName] = idp;
            }

            // Store data during the redirect
            const data = {
                hash,
                idp,
            };

            // Start a login redirect
            await this._userManager.signinRedirect({
                state: data,
                extraQueryParams,
            });

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle login responses on the main window
     */
    public async handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            // Only try to process a login response if the state exists
            const storedState = await this._userManager.settings.stateStore?.get(urlData.query.state);
            if (storedState) {

                let redirectLocation = '#';
                try {

                    // Process the login response and send the authorization code grant message
                    const user = await this._userManager.signinRedirectCallback();

                    // If an identity provider query parameter was set, save it after a successful login
                    if (user.state.idp) {
                        HtmlStorageHelper.identityProvider = user.state.idp;
                    }

                    // Redirect to the hash URL before the login redirect
                    redirectLocation = user.state.hash;

                } catch (e) {

                    // Handle and rethrow OAuth response errors
                    throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);

                } finally {

                    // Always replace the browser location, to remove OAuth details from back navigation
                    history.replaceState({}, document.title, redirectLocation);
                }
            }
        }
    }

    /*
     * Do the logout redirect
     */
    public async startLogout(): Promise<void> {

        try {
            await this._userManager.signoutRedirect();

        } catch (e) {
            throw ErrorHandler.getFromLogoutOperation(e, ErrorCodes.logoutRequestFailed);
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

        // Also make the refresh token in the secure cookie act expired
        await this._userManager.expireRefreshToken();
    }

    /*
     * Ask OIDC client to silently renew the access token using a cookie
     */
    private async _performTokenRefresh() {

        try {

            // Call the OIDC Client method, which will send a refresh token grant message
            await this._userManager.signinSilent();

        } catch (e) {

            if (this._isSessionExpired(e)) {

                // For invalid_grant errors, clear token data, which will force a login redirect
                await this._userManager.removeUser();

                // Also remove the refresh token
                await this._userManager.expireRefreshToken();

            } else {

                // Rethrow other errors
                throw ErrorHandler.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            }
        }
    }

    /*
     * Handle the idp query parameter when redirecting
     */
    private _getRuntimeIdentityProvider(): string {

        // Use idp= to remove the identity provider from storage
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.idp === '') {
            HtmlStorageHelper.removeIdentityProvider();
            return '';
        }

        // Use a value such as idp=Okta to select an identity provider
        if (urlData.query && urlData.query.idp) {
            return urlData.query.idp;
        }

        // Use a local storage value if it exists
        return HtmlStorageHelper.identityProvider;
    }

    /*
     * Treat certain errors as session expired
     */
    private _isSessionExpired(e: any): boolean {

        // An invalid_grant error code from the Authorization Server means an expired refresh token
        if (e.message === ErrorCodes.invalidGrant) {
            return true;
        }

        // This can happen when providers are not standards based, in which case we treat it as an invalid_grant
        // https://github.com/IdentityModel/oidc-client-js/issues/1058
        if (e.message === 'auth_time in id_token does not match original auth_time') {
            return true;
        }

        return false;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._performTokenRefresh = this._performTokenRefresh.bind(this);
    }
}
