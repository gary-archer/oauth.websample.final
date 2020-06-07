import isWebView from 'is-ua-webview';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {Authenticator} from './authenticator';
import {CognitoAuthenticator} from './cognito/cognitoAuthenticator';
import {WebViewAuthenticator} from './mobile/webViewAuthenticator';
import {OktaAuthenticator} from './okta/oktaAuthenticator';

/*
 * Create the authenticator based on configuration
 */
export class AuthenticatorFactory {

    /*
     * Return different authenticator strategies depending on the runtime configuration received
     */
    public static createAuthenticator(configuration: OAuthConfiguration): Authenticator {

        if (isWebView(navigator.userAgent)) {

            // When running in a mobile web view we create an authenticator that calls back the mobile app
            return new WebViewAuthenticator();

        } else if (configuration.authority.toLowerCase().indexOf('cognito') !== -1) {

            // Cognito has some limitations that we have to work around
            return new CognitoAuthenticator(configuration);

        } else {

            // The Okta authenticator is standards based
            return new OktaAuthenticator(configuration);
        }
    }
}
