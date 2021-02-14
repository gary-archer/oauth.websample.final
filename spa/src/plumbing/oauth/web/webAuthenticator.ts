import {InMemoryWebStorage, UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorHandler} from '../../errors/errorHandler';
import {ConcurrentActionHandler} from '../../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../../utilities/htmlStorageHelper';
import {Authenticator} from '../authenticator';
import {CustomLogoutManager} from './utilities/customLogoutManager';
import {WebAuthenticatorOptions} from './webAuthenticatorOptions';

/*
 * A web authenticator with standard behaviour that can be extended via a subclass
 */
export class WebAuthenticator implements Authenticator {

    protected _options: WebAuthenticatorOptions;
    private readonly _concurrencyHandler: ConcurrentActionHandler;
    private _userManager?: UserManager;

    public constructor(options: WebAuthenticatorOptions) {

        this._options = options;
        (this._options.settings as any).userStore = new WebStorageStateStore({ store: new InMemoryWebStorage() });

        this._concurrencyHandler = new ConcurrentActionHandler();
        this._setupCallbacks();
    }

    /*
     * Create the user manager during initialisation
     */
    public async initialise(): Promise<void> {

        // First create the user manager from settings
        this._userManager = this._createUserManager(this._options.settings);

        // When the user signs out from another browser tab, also remove tokens from this browser tab
        // This will only work if the Authorization Server has a check_session_iframe endpoint
        this._userManager.events.addUserSignedOut(async () => {
            this._userManager!.removeUser();
            this._options.onLoggedOut();
        });

        // Allow any derived classes to do extra work
        await this._onInitialise();
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
     * Try to refresh an access token in a synchronised manner across multiple views
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
    public async login(): Promise<void> {

        try {

            // Get the identity provider to use or default to unknown
            const idp = this._getRuntimeIdentityProvider();
            const extraQueryParams: any = {};
            if (idp) {
                extraQueryParams[this._options.configuration.idpParameterName] = idp;
            }

            // Store data during the redirect
            const data = {
                hash: location.hash,
                idp,
            };

            // Start the login redirect
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

            let redirectLocation = '#';
            try {

                // Only try to process a login response if the state exists
                const storedState = await this._userManager!.settings.stateStore?.get(urlData.query.state);
                if (storedState) {

                    // Process the login response and send the authorization code grant message
                    const user = await this._userManager!.signinRedirectCallback();

                    // If an identity provider query parameter was set, save it after a successful login
                    if (user.state.idp) {
                        HtmlStorageHelper.identityProvider = user.state.idp;
                    }

                    // We will redirect to the hash URL before the login redirect
                    redirectLocation = user.state.hash;

                    // Delete any local storage redirect state older than 5 minutes for incomplete login redirects
                    await this._userManager!.clearStaleState();
                }

            } catch (e) {

                // Handle and rethrow OAuth response errors
                throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);

            } finally {

                // Always replace the browser location, to remove OAuth details from back navigation
                history.replaceState({}, document.title, redirectLocation);
            }
        }
    }

    /*
     * Do the logout redirect
     */
    public async logout(): Promise<void> {

        try {

            // Allow derived classes to perform clean up
            await this._onSessionExpiring();

            // See if the provider supports standards based logout
            const endSessionEndpoint = await this._userManager!.metadataService.getEndSessionEndpoint();
            if (endSessionEndpoint) {

                // With some providers, during multi tab browsing we may not have an id token on the current tab
                const user = await this._userManager?.getUser();
                if (!user || !user.id_token) {
                    await this._userManager!.removeUser();
                    throw ErrorHandler.getFromMissingIdToken();
                }

                // Clean up state then invoke the standard behaviour
                await this._userManager!.signoutRedirect();

            } else {

                // Remove tokens from memory
                await this._userManager?.removeUser();

                // Then format the vendor specific URL and do the redirect
                const logoutManager = new CustomLogoutManager(this._options.webBaseUrl, this._options.configuration);
                const fullLogoutUrl = logoutManager.getCustomLogoutUrl();
                location.replace(fullLogoutUrl);
            }

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
     * The default implementation of creating the user manager can be overridden by derived classes
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
    protected async _onSessionExpiring(): Promise<void> {
    }

    /*
     * Ask OIDC client to silently renew the access token
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            // OIDC Client will either send a refresh token grant message or use a hidden iframe
            await this._userManager!.signinSilent();

        } catch (e) {

            if (this._isSessionExpired(e)) {

                // Remove token data, which will result in triggering a login redirect later
                await this._userManager!.removeUser();

                // Inform derived classes where applicable
                await this._onSessionExpiring();

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
