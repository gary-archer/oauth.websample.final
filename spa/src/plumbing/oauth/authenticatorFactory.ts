import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {UserAgentHelper} from '../utilities/userAgentHelper';
import {Authenticator} from './authenticator';
import {CognitoAuthenticator} from './cognito/cognitoAuthenticator';
import {MobileAuthenticator} from './mobile/mobileAuthenticator';
import {OktaAuthenticator} from './okta/oktaAuthenticator';

/*
 * Create the authenticator based on configuration
 */
export class AuthenticatorFactory {

    /*
     * Return different authenticator strategies depending on the runtime configuration received
     */
    public static createAuthenticator(configuration: OAuthConfiguration, postLoginAction: () => void): Authenticator {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a web view we create an authenticator that calls back the mobile app
            return new MobileAuthenticator(postLoginAction);

        } else if (configuration.authority.toLowerCase().indexOf('cognito') !== -1) {

            // Cognito has some limitations that we have to work around
            return new CognitoAuthenticator(configuration);

        } else {

            // The Okta authenticator is standards based
            return new OktaAuthenticator(configuration);
        }
    }
}
