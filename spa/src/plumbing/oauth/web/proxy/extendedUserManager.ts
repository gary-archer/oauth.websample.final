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
     * Ensure that Authorization Code Grant messages are routed via our web reverse proxy
     */
    public async initialise(): Promise<void> {
        await this._updateMetadata();
    }

    /*
     * Capture the response from the Authorization Code Grant message
     */
    public async processSigninResponse(url?: string, stateStore?: StateStore): Promise<SigninResponse> {

        const response = await super.processSigninResponse(url, stateStore) as any;
        this._onSignInResponse(response);
        return response;
    }

    /*
     * Ensure that Refresh Token Grant messages are routed via our web reverse proxy
     */
    public async signinSilent(args?: any): Promise<User> {

        await this._updateMetadata();
        return await super.signinSilent(args);
    }

    /*
     * Ensure that the token endpoint is pointed at our web reverse proxy
     */
    private async _updateMetadata(): Promise<void> {

        const metadata = await this.metadataService.getMetadata();
        metadata.token_endpoint = UrlHelper.append(this._webReverseProxyBaseUrl, 'token');
    }
}
