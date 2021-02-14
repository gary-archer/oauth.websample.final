import {UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import {UrlHelper} from '../../../utilities/urlHelper';
import {HybridTokenStorage} from '../storage/hybridTokenStorage';
import {WebAuthenticator} from '../webAuthenticator';
import {WebAuthenticatorOptions} from '../webAuthenticatorOptions';
import {ExtendedUserManager} from './extendedUserManager';
import {CustomMetadataService} from './customMetadataService';
import {WebReverseProxyClient} from './webReverseProxyClient';

/*
 * Extends the standard authenticator to handle refresh tokens stored in encrypted HTTP only cookies
 */
export class ExtendedWebAuthenticator extends WebAuthenticator {

    private _extendedUserManager?: ExtendedUserManager;
    private readonly _webReverseProxyClient: WebReverseProxyClient;

    public constructor(options: WebAuthenticatorOptions) {

        super(options);

        // We store OIDC state, but not tokens, in local storage
        // This is needed to make the library send token refresh grant messages for new browser tabs
        (this._options.settings as any).userStore = new WebStorageStateStore({ store: new HybridTokenStorage() });

        // Use a custom metadata implementation, so that we can override the token endpoint
        // @ts-expect-error - MetadataServiceCtor cannot be implemented in Typescript due to the unnamed method
        (this._options.settings as any).MetadataServiceCtor = settings => {
            const metadataService = new CustomMetadataService(settings);
            metadataService.setTokenEndpoint(UrlHelper.append(this._options.webBaseUrl, 'reverse-proxy/token'));
            return metadataService;
        };

        // Create an object to manage explicit calls to the web reverse proxy when required
        this._webReverseProxyClient = new WebReverseProxyClient(
            this._options.configuration.clientId,
            this._options.webBaseUrl,
            this._options.configuration.reverseProxyPath);

        this._setupDerivedCallbacks();
    }

    /*
     * Override the base class to make the refresh token in the HTTP only cookie act expired
     */
    public async expireRefreshToken(): Promise<void> {

        await super.expireAccessToken();
        await this._webReverseProxyClient.expireRefreshToken();
    }

    /*
     * Create a custom user manager used to subclass certain OAuth events
     */
    protected _createUserManager(settings: UserManagerSettings): UserManager {

        this._extendedUserManager = new ExtendedUserManager(settings, this._onSignInResponse);
        return this._extendedUserManager;
    }

    /*
     * Do extra initialisation for the proxy client
     */
    protected _onInitialise(): void {
        this._webReverseProxyClient.initialise();
    }

    /*
     * Handle the response of the authorization code grant message
     */
    private _onSignInResponse(response: any): void {
        this._webReverseProxyClient.storeCsrfFieldFromProxy(response);
    }

    /*
     * When a user session ends, ensure that the refresh token cookie is removed
     */
    protected async _onSessionExpiring(): Promise<void> {
        await this._webReverseProxyClient.clearRefreshToken();
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupDerivedCallbacks(): void {
        this._onSignInResponse = this._onSignInResponse.bind(this);
    }
}