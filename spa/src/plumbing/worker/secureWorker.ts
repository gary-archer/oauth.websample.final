import axios from 'axios';
import {expose} from 'comlink';

/*
 * This web worker deals with HTTP requests that use credentials
 */
export class SecureWorker {

    /*
     * The entry point for commands from the main side of the app
     */
    public async callApi(input: any): Promise<[number, any]> {

        try {

            const response = await axios.request({
                url: input.url,
                method: input.method,
                data: input.data,
                headers: input.headers,
            });

            return [response.status, response.data];

        } catch (e) {

            let status = 0;
            if (e.response && e.response.status) {
                status = e.response.status;
            }

            let data = null;
            if (e.response && e.response.data) {
                data = e.response.data;
            }

            return [status, data];
        }
    }
}

expose(SecureWorker);
