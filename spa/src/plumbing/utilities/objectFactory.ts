import {wrap, Remote} from 'comlink';
import Worker from 'worker-loader!../../api/client/accessTokenWebWorker';
import {AccessTokenWebWorker} from '../../api/client/accessTokenWebWorker';
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
    private _webWorker: Remote<AccessTokenWebWorker> | null;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
        this._webWorker = null;
    }

    /*
     * Create the web worker when running the SPA in a normal browser
     */
    public async initialize(): Promise<void> {

        if (!UserAgentHelper.isAndroidWebView() && !UserAgentHelper.isIosWebView()) {

            const RemoteChannel = wrap<typeof AccessTokenWebWorker>(new Worker());
            this._webWorker = await new RemoteChannel(this._configuration, SessionManager.get());
        }
    }

    /*
     * Return an authentication strategy based on runtime conditions
     */
    public createAuthenticator(): Authenticator {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a mobile web view we create an authenticator that calls back the mobile app
            return new MobileAuthenticator();

        } else {

            // The web authenticator uses a proxy API as a back end for front end and stores tokens in a web worker
            return new WebAuthenticator(this._configuration.oauth, SessionManager.get(), this._webWorker!);
        }
    }

    /*
     * Return a client for making API calls
     */
    public createApiClient(authenticator: Authenticator): ApiClient {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {

            // When running in a mobile web view we make direct fetch calls to APIs
            const mobileAuthenticator = authenticator as MobileAuthenticator;
            const channel = new ApiFetch(this._configuration.app, SessionManager.get(), mobileAuthenticator);
            return new ApiClient(channel);
        }

        // When running in a browser use a web worker to call APIs
        return new ApiClient(this._webWorker!);
    }
}
