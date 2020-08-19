import cookie from 'cookie';

/*
 * Encapsulate the lambda edge specific request format
 */
export class LambdaEdgeRequest {

    private readonly _request: any;
    private readonly _body: any;

    public constructor(request: any) {
        this._request = request;
        this._body = this._parseBody();
    }

    public get uri(): string {
        return this._request.uri.toLowerCase();
    }

    public get method(): string {
        return this._request.method.toLowerCase();
    }

    public get body(): any {
        return this._body;
    }

    /*
     * Get a normal header that is only expected to be supplied once
     *
     * headers: {
         'content-type': [{
           key: 'content-type',
           value: 'application/x-www-form-urlencoded'
         }
       }
     */
    public getHeader(name: string): string | null {

        if (this._request.headers) {
            for (const key in this._request.headers) {
                if (key && key === name) {
                    return this._request.headers[key][0].value;
                }
            }
        }

        return null;
    }

    /*
     * Get a header that occurs multiple times
     *
     * headers: {
         'cookie': [{
           key: 'cookie',
           value: 'aaa=111'
         },
         {
           key: 'cookie',
           value: 'bbb=222'
         }]
       }
     */
    public getHeaders(name: string): string[] {

        const values: string[] = [];

        // Iterate headers, which is an object with header names as keys, each of which have a key and value
        if (this._request.headers) {
            for (const key in this._request.headers) {
                if (key && key === name) {

                    // Add each item to results
                    this._request.headers[key].forEach((i: any) => {
                        values.push(i.value);
                    });
                }
            }
        }

        return values;
    }

    /*
     * Parse incoming cookies, which could be received in multiple strings
     * - Cookie: First=1; Second=2
     * - Cookie: Third=3
     */
    public getCookie(name: string): string | null {

        let result = null;

        // Look for all incoming cookie headers
        const headers = this.getHeaders('cookie');
        headers.forEach((ct) => {

            // Use a library to parse the cookie text
            const data = cookie.parse(ct);
            if (data[name]) {
                result = data[name];
            }
        });

        return result;
    }

    /*
     * On a developer PC we work with data from our test JSON files that is already an object
     */
    private _parseBody(): any {

        const body = this._request.body;
        if (!body || !body.data) {
            return null;
        }

        if (typeof body.data === 'object') {
            return body.data;
        }

        return this._parseBase64EncodedJson(body.data);
    }

    /*
     * When our lambda runs in AWS, request.body.data is base 64 encoded JSON text that needs parsing
     */
    private _parseBase64EncodedJson(input: any): any {

        const output: any = {};
        const formUrlEncodedData = Buffer.from(input, 'base64').toString();

        // Split data such as 'grant_type=authorization_code&code=e7acecd0-6ec7-458b-b776-05a0757db30b' into fields
        const nameValuePairs = formUrlEncodedData.trim().split('&');

        // Add each field to the JSON object
        nameValuePairs.forEach((nameValuePair: string) => {
            const parts = nameValuePair.split('=');
            if (parts.length === 2) {
                output[parts[0].trim()] = decodeURIComponent(parts[1].trim());
            }
        });

        // Return results
        return output;

    }
}
