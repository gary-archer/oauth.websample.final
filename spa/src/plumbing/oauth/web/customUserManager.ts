import {SigninResponse, StateStore, User, UserManager, UserManagerSettings} from 'oidc-client';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {UrlHelper} from '../../utilities/urlHelper';
import {CognitoLogoutUrlBuilder} from './cognitoLogoutUrlBuilder';
import {HybridTokenStorage} from './hybridTokenStorage';
import {WebReverseProxyClient} from './webReverseProxyClient';

/*
 * Extend the OIDC Client class to specialise some behaviour
 */
export class CustomUserManager extends UserManager {

    private readonly _webBaseUrl: string;
    private readonly _configuration: OAuthConfiguration;
    private readonly _tokenStorage: HybridTokenStorage;
    private readonly _webReverseProxyClient: WebReverseProxyClient;

    public constructor(
        webBaseUrl: string,
        configuration: OAuthConfiguration,
        tokenStorage: HybridTokenStorage,
        settings: UserManagerSettings) {

        // Initialise the base class
        super(settings);

        // Store configuration and create helpers
        this._webBaseUrl = webBaseUrl;
        this._configuration = configuration;
        this._tokenStorage = tokenStorage;
        this._webReverseProxyClient = new WebReverseProxyClient(configuration.clientId, this._getReverseProxyBaseUrl());
    }

    /*
     * Load and customise metadata, to route refresh token related requests via our reverse proxy
     */
    public async initialise(): Promise<void> {

        await this._updateMetadata();
        this._webReverseProxyClient.initialise();
    }

    /*
     * Capture the response from the Authorization Code Grant message
     */
    public async processSigninResponse(url?: string, stateStore?: StateStore): Promise<SigninResponse> {

        const response = await super.processSigninResponse(url, stateStore) as any;
        this._webReverseProxyClient.storeCsrfFieldFromProxy(response);
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

        // Always remove the auth cookie containing the refresh token
        await this.expireRefreshToken();

        // Perform the logout and some vendors use a bespoke solution
        if (this._configuration.authority.indexOf('cognito') !== -1) {
            await this._performCognitoLogout();
        } else {
            await this._performStandardsBasedLogout();
        }
    }

    /*
     * Call the server to expire the refresh token
     */
    public async expireRefreshToken(): Promise<void> {
        await this._webReverseProxyClient.clearRefreshToken();
    }

    /*
     * Ensure that the token endpoint is pointed at our web reverse proxy
     */
    private async _updateMetadata(): Promise<void> {

        const metadata = await this.metadataService.getMetadata();
        const reverseProxyBaseUrl = this._getReverseProxyBaseUrl();
        metadata.token_endpoint = UrlHelper.append(reverseProxyBaseUrl, 'token');
    }

    /*
     * Get the full path to the web reverse proxy base URL
     */
    private _getReverseProxyBaseUrl(): string {
        return UrlHelper.append(this._webBaseUrl, `${this._configuration.reverseProxyPath}`);
    }

    /*
     * Cognito uses a vendor specific form of logout
     */
    private async _performCognitoLogout(): Promise<void> {

        // Otherwise do a Cognito specific logout, by first removing tokens from memory
        await super.removeUser();

        // Redirect using a Cognito specific logout URL
        const builder = new CognitoLogoutUrlBuilder(this._webBaseUrl, this._configuration);
        const logoutRedirectUrl = builder.buildUrl();
        location.replace(logoutRedirectUrl);
    }

    /*
     * Do a standards based logout, by redirecting with an id token and post logout redirect uri
     */
    private async _performStandardsBasedLogout(): Promise<void> {

        const idToken = this._tokenStorage.getIdToken();
        if (idToken) {

            // Do a standards based redirect if have an id token on this browser tab
            await super.signoutRedirect();

        } else {

            // Otherwise clear tokens and redirect, to prevent an Authorization Server error page
            this.removeUser();
            location.href = this._configuration.postLogoutHashLocation;
        }
    }
}
