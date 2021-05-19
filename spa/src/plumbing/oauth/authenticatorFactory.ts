import {Configuration} from '../../configuration/configuration';
import {UserAgentHelper} from '../utilities/userAgentHelper';
import {Authenticator} from './authenticator';
import {MobileAuthenticator} from './mobile/mobileAuthenticator';
import {WebAuthenticator} from './web/webAuthenticator';

/*
 * Create the authenticator based on configuration
 */
export class AuthenticatorFactory {

    /*
     * Return different authenticator strategies depending on the configuration and runtime conditions
     */
    public static createAuthenticator(
        configuration: Configuration,
        onLoggedIn: () => void,
        onLoggedOut: () => void): Authenticator {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a mobile web view we create an authenticator that calls back the mobile app
            return new MobileAuthenticator(onLoggedIn);

        } else {

            // Otherwise create the standard SPA authenticator, which uses a proxy API as a back end for front end
            return new WebAuthenticator(configuration, onLoggedOut);
        }
    }
}
