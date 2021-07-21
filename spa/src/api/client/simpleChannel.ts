import {Configuration} from '../../configuration/configuration';
import {AccessTokenSupplier} from '../../plumbing/oauth/accessTokenSupplier';
import {ApiFetch} from './apiFetch';
import {Channel} from './channel';

/*
 * A simple channel makes a direct fetch call using the same fetch logic as within a web worker
 */
export class SimpleChannel implements Channel {

    private readonly _fetcher: ApiFetch;

    public constructor(configuration: Configuration, sessionId: string, accessTokenSupplier: AccessTokenSupplier) {
        this._fetcher = new ApiFetch(configuration, sessionId, accessTokenSupplier);
    }

    /*
     * A parameterized fetch method when not using a web worker
     */
    public async fetch(options: any): Promise<any> {
        return await this._fetcher.execute(options);
    }
}
