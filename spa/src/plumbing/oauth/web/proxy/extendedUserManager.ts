import {SigninResponse, StateStore, User, UserManager, UserManagerSettings} from 'oidc-client';

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
     * Override the base method to capture a CSRF token from the authorization code grant response
     */
    public async processSigninResponse(url?: string, stateStore?: StateStore): Promise<SigninResponse> {

        const tokenEndpoint = await this.metadataService.getTokenEndpoint();
        console.log(`*** AUTH CODE GRANT WITH ${tokenEndpoint}`);
        const response = await super.processSigninResponse(url, stateStore) as any;
        this._onSignInResponse(response);
        return response;
    }

    /*
     * Override the base method to send refresh token grant messages and include the above CSRF token
     */
    public async signinSilent(args?: any): Promise<User> {

        // We need a stored user at this stage, which is why we use HybridTokenStorage
        // The stored user needs a refresh token, which is why we set this dummy value
        await this._setStoredRefreshToken('-');

        // The silent renewal is now guaranteed to never be an iframe renewal request
        const tokenEndpoint = await this.metadataService.getTokenEndpoint();
        console.log(`*** REFRESH TOKEN GRANT WITH ${tokenEndpoint}`);
        const user = await super.signinSilent(args);

        // Undo the temporary value set above
        await this._setStoredRefreshToken('');

        // Return the updated user, with new tokens stored in memory
        return user;
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
