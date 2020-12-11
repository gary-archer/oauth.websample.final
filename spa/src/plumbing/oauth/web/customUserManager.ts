import {SigninResponse, StateStore, User, UserManager, UserManagerSettings} from 'oidc-client';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {UrlHelper} from '../../utilities/urlHelper';
import {CognitoLogoutUrlBuilder} from './cognitoLogoutUrlBuilder';
import {SecureCookieHelper} from './secureCookieHelper';

/*
 * Extend the OIDC Client class to specialise some behaviour
 */
export class CustomUserManager extends UserManager {

    private readonly _webBaseUrl: string;
    private readonly _configuration: OAuthConfiguration;
    private readonly _secureCookieHelper: SecureCookieHelper;

    public constructor(
        webBaseUrl: string,
        configuration: OAuthConfiguration,
        settings: UserManagerSettings) {

        // Initialise the base class
        super(settings)

        // Store configuration and create helpers
        this._webBaseUrl = webBaseUrl;
        this._configuration = configuration;
        this._secureCookieHelper = new SecureCookieHelper(configuration.clientId, this._getReverseProxyBaseUrl());
    }

    /*
     * Load and customise metadata, to route refresh token related requests via our reverse proxy
     */
    public async initialise(): Promise<void> {

        await this._updateMetadata();
        this._secureCookieHelper.initialise();
    }

    /*
     * Capture the response from the Authorization Code Grant message
     */
    public async processSigninResponse(url?: string, stateStore?: StateStore): Promise<SigninResponse> {

        const response = await super.processSigninResponse(url, stateStore) as any;
        this._secureCookieHelper.setCsrfFieldFromResponse(response);
        return response;
    }

    /*
     * Override sign in silent processing to use the reverse proxy token endpoint
     */
    public async signinSilent(args?: any): Promise<User> {

        await this._updateMetadata();
        return super.signinSilent(args);
    }

    /*
     * Override login to implement the Cognito vendor specific solution
     */
    public async signoutRedirect(): Promise<void> {

        if (this._configuration.authority.indexOf('cognito') !== -1) {

            // First remove tokens from memory
            await super.removeUser();

            // Handle Cognito logout specially
            const builder = new CognitoLogoutUrlBuilder(this._webBaseUrl, this._configuration);
            const logoutRedirectUrl = builder.buildUrl();
            location.replace(logoutRedirectUrl);

        } else {

            // Otherwise call OIDC Client to do the logout with standard behaviour
            await super.signoutRedirect();
        }

        // Then ensure that the auth cookie is gone
        await this.expireRefreshToken();
    }

    /*
     * Call the server to expire the refresh token
     */
    public async expireRefreshToken(): Promise<void> {
        await this._secureCookieHelper.clearRefreshToken();
    }

    /*
     * Ensure that the token endpoint is pointed at our web reverse proxy
     */
    private async _updateMetadata(): Promise<void> {

        const metadata = await this.metadataService.getMetadata();
        const reverseProxyBaseUrl = this._getReverseProxyBaseUrl();
        metadata!.token_endpoint = UrlHelper.append(reverseProxyBaseUrl, 'token');
    }

    /*
     * Get the full path to the web reverse proxy base URL
     */
    private _getReverseProxyBaseUrl(): string {
        return UrlHelper.append(this._webBaseUrl, `${this._configuration.reverseProxyPath}`);
    }
}
