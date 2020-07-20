import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {UserAgentHelper} from '../utilities/userAgentHelper';
import {Authenticator} from './authenticator';
import {MobileAuthenticator} from './mobile/mobileAuthenticator';
import {WebAuthenticator} from './web/webAuthenticator';

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

        } else {

            // Otherwise use our web authenticator
            return new WebAuthenticator(configuration);
        }
    }
}
