import {ClientError} from '../errors/clientError';

/*
 * Encapsulate a lambda edge response
 */
export class LambdaEdgeResponse {

    private readonly _data: any;
    private readonly _headers: [string, string[]][];

    public constructor() {
        this._data = {};
        this._headers = [];
    }

    public set statusCode(statusCode: number) {
        this._data.statusCode = statusCode;
    }

    public set body(data: any) {
        this._data.body = data;
    }

    /*
     * In lambda edge, headers are arrays of objects containing 'key' and 'value' fields
     */
    public addHeader(name: string, value: string) {

        const found = this._headers.find((h) => h[0] === name);
        if (!found) {

            // Create a new key if required
            const items: string[] = [];
            items.push(value);
            this._headers.push([name, items]);

        } else {

            // Otherwise add values to the existing key
            found[1].push(value);
        }
    }

    public setError(error: ClientError) {
        this._data.statusCode = error.statusCode;
        this._data.body = error.toResponseFormat();
    }

    /*
     * Output in Lambda Edge's particular format, where headers are an array of objects
     *
     * headers: {
         'set-cookie': [{
           key: 'set-cookie',
           value: 'aaa=111'
         },
         {
           key: 'set-cookie',
           value: 'bbb=222'
         }]
       }
     */
    public toLambdaEdgeFormat(): any {

        const data: any = {
            status: this._data.statusCode ?? 200,
        };

        if (this._data.body) {
            data.body = JSON.stringify(this._data.body);
            this.addHeader('content-type', 'application/json');
        }

        if (this._headers.length > 0) {

            const outputHeaders: any = {};
            this._headers.forEach((h) => {

                const name = h[0];
                const items: any[] = [];

                const values = h[1];
                values.forEach((v) => {
                    items.push({key: name, value: v});
                });

                outputHeaders[name] = items;
            });

            data.headers = outputHeaders;
        }

        return data;
    }
}
