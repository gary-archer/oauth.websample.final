import {SigninResponse, StateStore, User, UserManager, UserManagerSettings} from 'oidc-client';
import {UrlHelper} from '../../../utilities/urlHelper';

/*
 * Extend the OIDC User Manager class to deal with proxying aspects
 */
export class ExtendedUserManager extends UserManager {

    private readonly _webReverseProxyBaseUrl: string
    private readonly _onSignInResponse: (response: any) => void;

    public constructor(
        settings: UserManagerSettings,
        webReverseProxyBaseUrl: string,
        onSignInResponse: (response: any) => void) {

        super(settings);
        this._webReverseProxyBaseUrl = webReverseProxyBaseUrl;
        this._onSignInResponse = onSignInResponse;
    }

    /*
     * Ensure that Token Endpoint requests are routed via our web reverse proxy
     */
    public async initialise(): Promise<void> {
        await this._updateMetadataTokenEndpoint();
    }

    /*
     * Capture a CSRF token from the Authorization Code Grant response
     */
    public async processSigninResponse(url?: string, stateStore?: StateStore): Promise<SigninResponse> {

        const response = await super.processSigninResponse(url, stateStore) as any;
        this._onSignInResponse(response);
        return response;
    }

    /*
     * Handle Refresh Token Grant messages, which will send the above CSRF token
     */
    public async signinSilent(args?: any): Promise<User> {

        // Ensure that we route silent renewal requests via the web reverse proxy
        await this._updateMetadataTokenEndpoint();

        // We need a stored user at this stage, which is why we use HybridTokenStorage
        // The stored user needs a refresh token, which is why we set this dummy value
        await this._setStoredRefreshToken('-');

        // The silent renewal is now guaranteed to never be an iframe renewal request
        const user = await super.signinSilent(args);

        // Undo the temporary value set above
        await this._setStoredRefreshToken('');

        // Return the updated user, with new tokens in memory
        return user;
    }

    /*
     * Ensure that the token endpoint of the web reverse proxy is used
     */
    public async _updateMetadataTokenEndpoint(): Promise<void> {

        const metadata = await this.metadataService.getMetadata();
        metadata.token_endpoint = UrlHelper.append(this._webReverseProxyBaseUrl, 'token');
    }

    /*
     * Temporarily change the stored refresh token value to get the behaviour we want
     */
    private async _setStoredRefreshToken(value: string): Promise<void> {

        const user = await this.getUser();
        if (user) {
            user.refresh_token = value;
            await this.storeUser(user);
        }
    }
}
