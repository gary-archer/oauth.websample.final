
import {UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {UrlHelper} from '../../utilities/urlHelper';
import {Authenticator} from '../authenticator';
import {CustomLogoutManager} from './logout/customLogoutManager';
import {HybridTokenStorage} from './storage/hybridTokenStorage';

/*
 * A web authenticator with standard behaviour that can be extended via a subclass
 */
export class WebAuthenticator implements Authenticator {

    private readonly _webBaseUrl: string;
    private readonly _configuration: OAuthConfiguration;
    private readonly _userManagerSettings: UserManagerSettings;
    private readonly _tokenStorage: HybridTokenStorage;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private readonly _onLoggedOut: () => void;
    private _userManager?: UserManager;

    public constructor(
        webBaseUrl: string,
        configuration: OAuthConfiguration,
        onLoggedOut: () => void) {

        // Store settings
        this._webBaseUrl = webBaseUrl;
        this._configuration = configuration;
        this._tokenStorage = new HybridTokenStorage();
        this._concurrencyHandler = new ConcurrentActionHandler();
        this._onLoggedOut = onLoggedOut;

        // Configure main OAuth settings
        this._userManagerSettings = {

            // The Open Id Connect base URL
            authority: configuration.authority,

            // Core OAuth settings for our app
            client_id: configuration.clientId,
            redirect_uri: UrlHelper.append(webBaseUrl, configuration.redirectUri),
            scope: configuration.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // Store tokens in memory and multi tab state in local storage
            userStore: new WebStorageStateStore({ store: this._tokenStorage }),

            // Renew on the app's main URL and do so explicitly rather than via a background timer
            silent_redirect_uri: UrlHelper.append(webBaseUrl, configuration.redirectUri),
            automaticSilentRenew: false,

            // Our Web UI gets user info from its API, so that it is not limited to only OAuth user info
            loadUserInfo: false,

            // Indicate the logout return path and listen for logout events from other browser tabs
            monitorSession: true,
            post_logout_redirect_uri: UrlHelper.append(webBaseUrl, configuration.postLogoutRedirectUri),
        };

        this._setupCallbacks();
    }

    /*
     * Create the user manager during initialisation
     */
    public async initialise(): Promise<void> {

        // First create the user manager from settings
        this._userManager = this._createUserManager(this._userManagerSettings);

        // When the user signs out from another browser tab, also remove tokens from this browser tab
        // This will only work if the Authorization Server has a check_session_iframe endpoint
        this._userManager.events.addUserSignedOut(async () => {
            this._userManager!.removeUser();
            this._onLoggedOut();
        });

        // Allow any derived classes to do extra work
        await this._onInitialise();
    }

    /*
     * Return true if login state existing and there are tokens in memory
     */
    public async isLoggedIn(): Promise<boolean> {

        const user = await this._userManager!.getUser();
        if (user && user.access_token) {
            return true;
        }

        return false;
    }

    /*
     * Get an access token if possible, which will retrieve it from storage
     */
    public async getAccessToken(): Promise<string> {

        // Get tokens from OIDC client
        const user = await this._userManager!.getUser();
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
        let user = await this._userManager!.getUser();
        if (user) {

            // The concurrency handler will only do the refresh work for the first UI view that requests it
            await this._concurrencyHandler.execute(this._performTokenRefresh);

            // Return the renewed access token if possible
            user = await this._userManager!.getUser();
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
            await this._userManager!.signinRedirect({
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
            const storedState = await this._userManager!.settings.stateStore?.get(urlData.query.state);
            if (storedState) {

                let redirectLocation = '#';
                try {

                    // Process the login response and send the authorization code grant message
                    const user = await this._userManager!.signinRedirectCallback();

                    // If an identity provider query parameter was set, save it after a successful login
                    if (user.state.idp) {
                        HtmlStorageHelper.identityProvider = user.state.idp;
                    }

                    // We will redirect to the hash URL before the login redirect
                    redirectLocation = user.state.hash;

                    // Finally, clear up any stale redirect state from older login redirects
                    this._userManager?.clearStaleState();

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

            // See if the provider supports standards based logout
            const endSessionEndpoint = await this._userManager!.metadataService.getEndSessionEndpoint();
            if (endSessionEndpoint) {

                // With some providers, during multi tab browsing we may not have an id token on the current tab
                if (!this._tokenStorage.getIdToken()) {
                    throw new Error('No id token is present so cannot perform standards based logout');
                }

                // Clean up state then invoke the standard behaviour
                await this._userManager!.signoutRedirect();

            } else {

                // Remove tokens from memory
                await this._userManager?.removeUser();

                // Then format the vendor specific URL and do the redirect
                const logoutManager = new CustomLogoutManager(this._webBaseUrl, this._configuration);
                const fullLogoutUrl = logoutManager.getCustomLogoutUrl();
                location.replace(fullLogoutUrl);
            }

            // Allow derived classes to clean up their state
            await this._onSessionExpired();

        } catch (e) {

            // Handle any technical errors
            throw ErrorHandler.getFromLogoutOperation(e, ErrorCodes.logoutRequestFailed);

        }
    }

    /*
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {

        const user = await this._userManager!.getUser();
        if (user) {

            user.access_token = 'x' + user.access_token + 'x';
            this._userManager!.storeUser(user);
        }
    }

    /*
     * For testing, make the refresh token act like it is expired, when applicable
     */
    public async expireRefreshToken(): Promise<void> {

        // First expire the access token so that the next API call returns a 401
        await this.expireAccessToken();

        // Expire the refresh token if we have one
        const user = await this._userManager!.getUser();
        if (user && user.refresh_token) {
            user.refresh_token = 'x' + user.refresh_token + 'x';
            this._userManager!.storeUser(user);
        }
    }

    /*
     * The default implementation of creating the user manager
     */
    protected _createUserManager(settings: UserManagerSettings): UserManager {
        return new UserManager(settings);
    }

    /*
     * Can be overridden by derived classes to do further initialisation
     */
    protected async _onInitialise(): Promise<void> {
    }

    /*
     * Can be overridden by derived classes to do further work when a session expires
     */
    protected async _onSessionExpired(): Promise<void> {
    }

    /*
     * Ask OIDC client to silently renew the access token using a cookie
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            // Call the OIDC Client method, which will send a refresh token grant message
            await this._userManager!.signinSilent();

        } catch (e) {

            if (this._isSessionExpired(e)) {

                // Remove token data, which will result in triggering a login redirect later
                await this._userManager!.removeUser();

                // Inform derived classes where applicable
                await this._onSessionExpired();

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

        // A login_required error code means iframe silent renewal has failed
        if (e.error === ErrorCodes.loginRequired) {
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
