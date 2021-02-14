import {SigninResponse, StateStore, User, UserManager, UserManagerSettings} from 'oidc-client';

/*
 * Extend the OIDC User Manager class to deal with proxying refresh token related requests
 * This keeps long lived credentials out of the browser and also resolves usability problems
 */
export class ExtendedUserManager extends UserManager {

    private readonly _onSignInResponse: (response: any) => void;

    public constructor(settings: UserManagerSettings, onSignInResponse: (response: any) => void) {
        super(settings);
        this._onSignInResponse = onSignInResponse;
    }

    /*
     * Override the base method to capture a CSRF token from the authorization code grant response
     */
    public async processSigninResponse(url?: string, stateStore?: StateStore): Promise<SigninResponse> {

        const response = await super.processSigninResponse(url, stateStore) as any;
        this._onSignInResponse(response);
        return response;
    }

    /*
     * Override the base method to force a send of refresh token grant messages
     */
    public async signinSilent(args?: any): Promise<User> {

        // The stored user needs a refresh token, which is why we set this dummy value
        await this._setStoredRefreshToken('-');

        // The silent renewal is now guaranteed to never be an iframe renewal request
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
