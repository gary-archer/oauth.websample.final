import {wrap, Remote} from 'comlink';
import Worker from 'worker-loader!./api/client/secureWorker';
import {ApiClient} from '../../api/client/apiClient';
import {SimpleChannel} from '../../api/client/simpleChannel';
import {WorkerChannel} from '../../api/client/workerChannel';
import {Configuration} from '../../configuration/configuration';
import {UserAgentHelper} from '../utilities/userAgentHelper';
import {Authenticator} from './authenticator';
import {MobileAuthenticator} from './mobile/mobileAuthenticator';
import {WebAuthenticator} from './web/webAuthenticator';

/*
 * A class to create global objects on application startup and manage supplying the web worker
 */
export class AuthenticatorFactory {

    private _configuration: Configuration;
    private _webWorker: Remote<WorkerChannel> | null;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
        this._webWorker = null;
    }

    /*
     * Create the web worker unless we are running within the mobile web sample
     */
    public async initialize(): Promise<void> {

        if (!UserAgentHelper.isAndroidWebView() && !UserAgentHelper.isIosWebView()) {

            const RemoteChannel = wrap<typeof WorkerChannel>(new Worker());
            this._webWorker = await new RemoteChannel(this._configuration);
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
            return new WebAuthenticator(this._configuration, this._webWorker!);
        }
    }

    /*
     * Return an API client strategy
     */
    public createApiClient(authenticator: Authenticator): ApiClient {

        if (UserAgentHelper.isAndroidWebView() || UserAgentHelper.isIosWebView()) {
            return new ApiClient(new SimpleChannel(this._configuration, authenticator));
        }

        return new ApiClient(this._webWorker!);
    }
}
