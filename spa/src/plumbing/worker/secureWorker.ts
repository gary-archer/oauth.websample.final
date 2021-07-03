import axios from 'axios';
import * as comlink from 'comlink';

/*
 * This web worker deals with HTTP requests that use credentials
 */
export class SecureWorker {

    /*
     * The entry point for commands from the main side of the app
     */
    public async callApi(input: any): Promise<any> {

        console.log('*** calling API: ' + input.url);
        return axios.request({
            url: input.url,
            method: input.method,
            data: input.data,
            headers: input.headers,
        });
    }
}

comlink.expose(SecureWorker);
