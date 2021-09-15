import {ApiClient} from '../../api/client/apiClient';
import {ApiFetch} from '../../api/client/apiFetch';
import {Configuration} from '../../configuration/configuration';
import {UserAgentHelper} from '../utilities/userAgentHelper';
import {Authenticator} from '../oauth/authenticator';
import {MobileAuthenticator} from '../oauth/mobile/mobileAuthenticator';
import {WebAuthenticator} from '../oauth/web/webAuthenticator';
import {SessionManager} from './sessionManager';

/*
 * A class to create global objects on application startup and manage supplying the web worker
 */
export class ObjectFactory {

    private _configuration: Configuration;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
    }

    /*
     * Return an authentication strategy based on runtime conditions
     */
    public createAuthenticator(onLoginComplete: () => void): Authenticator {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a mobile web view the SPA calls the mobile app to do OAuth work
            return new MobileAuthenticator(onLoginComplete);

        } else {

            // The web authenticator uses a proxy API as a back end for front end and stores tokens in a web worker
            return new WebAuthenticator(this._configuration.oauth, SessionManager.get());
        }
    }

    /*
     * Return a client for making API calls
     */
    public createApiClient(authenticator: Authenticator): ApiClient {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a mobile web view we send access tokens to the API entry point
            const mobileAuthenticator = authenticator as MobileAuthenticator;
            const channel = new ApiFetch(this._configuration.app, SessionManager.get(), mobileAuthenticator);
            return new ApiClient(channel);

        } else {

            // When running in a browser we send SameSite cookies to the API entry point
            const webAuthenticator = authenticator as WebAuthenticator;
            const channel = new ApiFetch(this._configuration.app, SessionManager.get(), webAuthenticator);
            return new ApiClient(channel);
        }
    }
}
