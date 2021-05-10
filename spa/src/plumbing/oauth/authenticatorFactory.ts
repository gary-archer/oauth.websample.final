import {UserAgentHelper} from '../utilities/userAgentHelper';
import {Authenticator} from './authenticator';
import {MobileAuthenticator} from './mobile/mobileAuthenticator';

/*
 * Create the authenticator based on configuration
 */
export class AuthenticatorFactory {

    /*
     * Return different authenticator strategies depending on the configuration and runtime conditions
     */
    public static createAuthenticator(onLoggedIn: () => void): Authenticator {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a web view we create an authenticator that calls back the mobile app
            return new MobileAuthenticator(onLoggedIn);

        } else {

            throw new Error('Not implemented');
        }
    }
}
