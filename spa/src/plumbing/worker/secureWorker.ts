import {expose} from 'comlink';

/*
 * Access tokens are isolated within a web worker, where this code runs
 */
export class SecureWorker {

    private _accessToken: string | null;
    private readonly _refreshTokenAction?: () => Promise<string>;

    public constructor(refreshTokenAction: () => Promise<string>) {
        this._accessToken = null;
        this._refreshTokenAction = refreshTokenAction;
    }

    /*
     * Do the work of calling APIs within the web worker and retrying with a fresh token when needed
     */
    public async callApiWithAccessToken(callApiAction: (token: string) => Promise<any>): Promise<void> {

        if (!this._accessToken) {
            
            // If we don't have an access token, try to get one then call the API
            this._accessToken = await this._refreshTokenAction!();
            return callApiAction(this._accessToken);

        } else {

            // Otherwise call the API, then retry with a fresh token if we get a 401
            try {

                return await callApiAction(this._accessToken);

            } catch (e) {

                if (this._isApi401Error(e)) {

                    this._accessToken = await this._refreshTokenAction!();
                    return callApiAction(this._accessToken);
                }
            }
        }
    }

    /*
     * Clear the access token on logout or session expiry
     */
    public async clearAccessToken(): Promise<void> {
        this._accessToken = null;
    }

    /*
     * Make the access token act expired, for testing purposes
     */
    public async expireAccessToken(): Promise<void> {

        if (this._accessToken) {
            this._accessToken = `x${this._accessToken}x`;
        }
    }

    /*
     * API 401s are handled via a retry with a new token
     */
    private _isApi401Error(error: any) {

        if (error.response && error.response.status === 401) {
            return true;
        }

        return false;
    }
}

expose(SecureWorker);
