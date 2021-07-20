import {Method} from 'axios';
import {expose} from 'comlink';
import {Configuration} from '../../configuration/configuration';
import {WebAuthenticatorEvents} from '../../plumbing/oauth/web/webAuthenticatorEvents';
import {WebAuthenticatorWorker} from '../../plumbing/oauth/web/webAuthenticatorWorker';
import {ApiFetch} from './apiFetch';
import {Channel} from './channel';
import {ApiRequestOptions} from './apiRequestOptions';

/*
 * The web worker creates its own copies of objects from the data supplied
 */
export class WorkerChannel implements Channel, WebAuthenticatorEvents {

    private readonly _authenticator: WebAuthenticatorWorker;
    private readonly _fetcher: ApiFetch;
    
    public constructor(configuration: Configuration) {

        this._authenticator = new WebAuthenticatorWorker(configuration);
        this._fetcher = new ApiFetch(configuration, this._authenticator);
    }

    /*
     * A generic entry point for calling the API
     */
    public async fetch(
        path: string,
        method: Method,
        dataToSend?: any,
        options?: ApiRequestOptions): Promise<any> {

        return await this._fetcher.execute(path, method, dataToSend, options);
    }

    /*
     * Clear the access token stored in the authenticator
     */
    public async onClearAccessToken(): Promise<void> {
        this._authenticator.expireAccessToken();
    }

    /*
     * For testing, make the access token stored in the authenticator act expired
     */
    public async onExpireAccessToken(): Promise<void> {
        this._authenticator.expireAccessToken();
    }
}

expose(WorkerChannel);
