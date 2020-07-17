import {SigninResponse, StateStore, User, UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {HybridTokenStorage} from './hybridTokenStorage';

/*
 * Extend the OIDC Client class to specialise some behaviour
 */
export class CustomUserManager extends UserManager {

    private readonly _configuration: OAuthConfiguration;

    public constructor(configuration: OAuthConfiguration) {
        super(CustomUserManager.getSettings(configuration))
        this._configuration = configuration;
    }

    /*
     * Supply  OIDC Client settings
     */
    public static getSettings(configuration: OAuthConfiguration): UserManagerSettings {

        return {

            // The Open Id Connect base URL
            authority: configuration.authority,

            // Core OAuth settings for our app
            client_id: configuration.clientId,
            redirect_uri: configuration.appUri,
            scope: configuration.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // We use a proxying cookie based solution to refresh access tokens
            automaticSilentRenew: false,

            // We get extended user info from our API and do not use this feature
            loadUserInfo: false,

            // Tokens are stored only in memory, but we store multi tab state in local storage
            // https://auth0.com/docs/tokens/guides/store-tokens
            userStore: new WebStorageStateStore({ store: new HybridTokenStorage() }),

            // Indicate the path in our app to return to after logout
            post_logout_redirect_uri: `${configuration.appUri}${configuration.postLogoutPath}`,
        };
    }

    /*
     * Capture the response from the Authorization Code Grant message
     */
    public async processSigninResponse(url?: string, stateStore?: StateStore): Promise<SigninResponse> {

        const response = await super.processSigninResponse(url, stateStore) as any;

        /*
         * We could read custom fields from the response here if needed, such as a CSRF value
         */

        return response;
    }

    /*
     * Send the Refresh Token Grant message, but with an empty refresh token in the request body
     * The refresh token is instead implicitly sent in an encrypted auth cookie
     */
    public async signinSilent(): Promise<User> {

        /*
         * We could add extra fields to the request body here if needed, such as a CSRF value
         */

        const options = {};
        return super.signinSilent(options)
    }
}
