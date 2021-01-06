import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {UserAgentHelper} from '../utilities/userAgentHelper';
import {Authenticator} from './authenticator';
import {MobileAuthenticator} from './mobile/mobileAuthenticator';
import {ExtendedWebAuthenticator} from './web/proxy/extendedWebAuthenticator';
import {WebAuthenticator} from './web/webAuthenticator';

/*
 * Create the authenticator based on configuration
 */
export class AuthenticatorFactory {

    /*
     * Return different authenticator strategies depending on the configuration and runtime conditions
     */
    public static createAuthenticator(
        webBaseUrl: string,
        configuration: OAuthConfiguration,
        onLoggedIn: () => void,
        onLoggedOut: () => void): Authenticator {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a web view we create an authenticator that calls back the mobile app
            return new MobileAuthenticator(onLoggedIn);

        } else {

            // Otherwise use a browser based flow
            if (!configuration.reverseProxyPath) {

                // Use standard SPA security by default
                return new WebAuthenticator(webBaseUrl, configuration, onLoggedOut);

            } else {

                // Use an extended authenticator when proxying requests containing refresh tokens
                return new ExtendedWebAuthenticator(webBaseUrl, configuration, onLoggedOut);
            }
        }
    }
}
