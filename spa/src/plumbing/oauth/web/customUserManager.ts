import {SigninResponse, StateStore, User, UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {CognitoLogoutUrlBuilder} from './cognitoLogoutUrlBuilder';
import {HybridTokenStorage} from './hybridTokenStorage';
import {SecureCookieHelper} from './secureCookieHelper';

/*
 * Extend the OIDC Client class to specialise some behaviour
 */
export class CustomUserManager extends UserManager {

    private readonly _configuration: OAuthConfiguration;
    private readonly _secureCookieHelper: SecureCookieHelper;

    public constructor(configuration: OAuthConfiguration, secureCookieHelper: SecureCookieHelper) {
        
        // Construct the settings class in order to initialise the base class
        super(CustomUserManager.getSettings(configuration))

        // Store other fields
        this._configuration = configuration;
        this._secureCookieHelper = secureCookieHelper;
    }

    /*
     * Create settings for the OIDC Client UserManager class
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
        this._secureCookieHelper.readCsrfFieldFromResponse(response);
        return response;
    }

    /*
     * Override login to implement the Cognito vendor specific solution
     */ 
    public async signoutRedirect(): Promise<void> {

        if (this._configuration.authority.indexOf('cognito') !== -1) {

            // First remove tokens from memory
            await super.removeUser();

            // Handle Cognito logout specially
            const builder = new CognitoLogoutUrlBuilder(this._configuration);
            const logoutRedirectUrl = builder.buildUrl();
            location.replace(logoutRedirectUrl);

        } else {

            // Otherwise call OIDC Client which will do all of the right things
            await super.signoutRedirect();
        }
    }
}
