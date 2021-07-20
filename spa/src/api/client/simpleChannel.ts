import {Method} from 'axios';
import {Configuration} from '../../configuration/configuration';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {ApiRequestOptions} from './apiRequestOptions';
import {ApiFetch} from './apiFetch';
import {Channel} from './channel';

export class SimpleChannel implements Channel {

    private readonly _fetcher: ApiFetch;
    
    public constructor(configuration: Configuration, authenticator: Authenticator) {
        this._fetcher = new ApiFetch(configuration, authenticator);
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
}
