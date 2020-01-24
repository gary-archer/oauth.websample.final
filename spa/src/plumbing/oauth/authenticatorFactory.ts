import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {Authenticator} from './authenticator';
import {CognitoAuthenticator} from './cognitoAuthenticator';
import {OktaAuthenticator} from './oktaAuthenticator';

/*
 * Create the authenticator based on configuration
 */
export class AuthenticatorFactory {

    /*
     * Return different authenticator strategies depending on the runtime configuration received
     */
    public static createAuthenticator(configuration: OAuthConfiguration): Authenticator {

        if (configuration.authority.toLowerCase().indexOf('cognito') !== -1) {

            // Cognito has some unusual logout requirements
            return new CognitoAuthenticator(configuration);
        } else {

            // Okta is standards based
            return new OktaAuthenticator(configuration);
        }
    }
}
