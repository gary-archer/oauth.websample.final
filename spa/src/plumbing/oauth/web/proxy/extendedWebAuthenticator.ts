import { suppressDeprecationWarnings } from 'moment';
import {UserManager, UserManagerSettings} from 'oidc-client';
import {OAuthConfiguration} from '../../../../configuration/oauthConfiguration';
import { ErrorConsoleReporter } from '../../../errors/errorConsoleReporter';
import {UrlHelper} from '../../../utilities/urlHelper';
import {WebAuthenticator} from '../webAuthenticator';
import {ExtendedUserManager} from './extendedUserManager';
import {WebReverseProxyClient} from './webReverseProxyClient';

/*
 * Subclass the standard authenticator to provide custom behaviour
 */
export class ExtendedWebAuthenticator extends WebAuthenticator {

    private _extendedUserManager?: ExtendedUserManager;
    private readonly _webReverseProxyBaseUrl: string;
    private readonly _webReverseProxyClient: WebReverseProxyClient;

    public constructor(
        webBaseUrl: string,
        configuration: OAuthConfiguration,
        onLoggedOut: () => void) {

        // Initialise the base class
        super(webBaseUrl, configuration, onLoggedOut);

        // Create a client that will proxy refresh token requests later
        this._webReverseProxyBaseUrl = UrlHelper.append(webBaseUrl, configuration.reverseProxyPath);
        this._webReverseProxyClient = new WebReverseProxyClient(configuration.clientId, this._webReverseProxyBaseUrl);
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

        this._extendedUserManager = new ExtendedUserManager(
            settings,
            this._webReverseProxyBaseUrl,
            this._onSignInResponse);

        return this._extendedUserManager;
    }

    /*
     * Do extra initialisation for the proxy client
     */
    protected async _onInitialise(): Promise<void> {
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
    protected async _onSessionExpired(): Promise<void> {
        await this._webReverseProxyClient.clearRefreshToken();
    }
}