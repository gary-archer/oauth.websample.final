import {InMemoryWebStorage, WebStorageStateStore} from 'oidc-client';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {UrlHelper} from '../utilities/urlHelper';
import {UserAgentHelper} from '../utilities/userAgentHelper';
import {Authenticator} from './authenticator';
import {MobileAuthenticator} from './mobile/mobileAuthenticator';
import {ExtendedWebAuthenticator} from './web/extended/extendedWebAuthenticator';
import {WebAuthenticator} from './web/webAuthenticator';
import {WebAuthenticatorOptions} from './web/webAuthenticatorOptions';

/*
 * Create the authenticator based on configuration
 */
export class AuthenticatorFactory {

    /*
     * Return different authenticator strategies depending on the configuration and runtime conditions
     */
    public static createAuthenticator(
        configuration: OAuthConfiguration,
        webBaseUrl: string,
        onLoggedIn: () => void,
        onLoggedOut: () => void): Authenticator {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a web view we create an authenticator that calls back the mobile app
            return new MobileAuthenticator(onLoggedIn);

        } else {

            const options = AuthenticatorFactory._createWebAuthenticatorOptions(
                configuration,
                webBaseUrl,
                onLoggedOut);

            if (!configuration.reverseProxyPath) {

                // Use standard SPA security by default
                return new WebAuthenticator(options);

            } else {

                // Use an extended authenticator when proxying requests containing refresh tokens
                return new ExtendedWebAuthenticator(options);
            }
        }
    }

    /*
     * Create the base settings for a web authenticator
     */
    private static _createWebAuthenticatorOptions(
        configuration: OAuthConfiguration,
        webBaseUrl: string,
        onLoggedOut: () => void): WebAuthenticatorOptions {

        return {

            configuration,
            webBaseUrl,
            onLoggedOut,
            settings: {

                // The Open Id Connect base URL
                authority: configuration.authority,

                // Core OAuth settings for our app
                client_id: configuration.clientId,
                redirect_uri: UrlHelper.append(webBaseUrl, configuration.redirectUri),
                scope: configuration.scope,

                // Use the Authorization Code Flow (PKCE)
                response_type: 'code',

                // By default, store tokens only in memory
                userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),

                // Renew on the app's main URL and do so explicitly rather than via a background timer
                silent_redirect_uri: UrlHelper.append(webBaseUrl, configuration.redirectUri),
                automaticSilentRenew: false,

                // Our Web UI gets user info from its API
                loadUserInfo: false,

                // Indicate the logout return path and listen for logout events from other browser tabs
                post_logout_redirect_uri: UrlHelper.append(webBaseUrl, configuration.postLogoutRedirectUri),
                monitorSession: true,
            },
        };
    }
}
