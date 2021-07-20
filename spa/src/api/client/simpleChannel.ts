import {Method} from 'axios';
import {Configuration} from '../../configuration/configuration';
import {AccessTokenSupplier} from '../../plumbing/oauth/accessTokenSupplier';
import {ApiRequestOptions} from './apiRequestOptions';
import {ApiFetch} from './apiFetch';
import {Channel} from './channel';

/*
 * A simple channel just makes a direct fetch call
 */
export class SimpleChannel implements Channel {

    private readonly _fetcher: ApiFetch;

    public constructor(configuration: Configuration, sessionId: string, accessTokenSupplier: AccessTokenSupplier) {
        this._fetcher = new ApiFetch(configuration, sessionId, accessTokenSupplier);
    }

    /*
     * A parameterized fetch method when not using a web worker
     */
    public async fetch(
        path: string,
        method: Method,
        dataToSend?: any,
        options?: ApiRequestOptions): Promise<any> {

        return await this._fetcher.execute(path, method, dataToSend, options);
    }
}
