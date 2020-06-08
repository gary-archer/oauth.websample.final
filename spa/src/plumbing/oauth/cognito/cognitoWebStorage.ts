/*
 * An adapter class to manage session storage of Cognito tokens due to lack of support for prompt=none
 * This trade off ensures that users do not need to re-login whenever the browser tab is refreshed
 */
export class CognitoWebStorage {

    // We only store the refresh token in memory
    private _refreshToken: string;

    public constructor() {
        this._refreshToken = '';
    }

    /*
     * Override the getItem method to use the in memory refresh token
     */
    public getItem(key: string): any {

        const rawData = sessionStorage.getItem(key);
        if (rawData) {
            const deserialized = JSON.parse(rawData);
            deserialized.refresh_token = this._refreshToken;
            return JSON.stringify(deserialized);
        }

        return null;
    }

    /*
     * Override the setItem method to save a dummy value for the refresh token
     * The real refresh token is stored in memory above
     */
    public setItem(key: string, value: any): any {

        const deserialized = JSON.parse(value);
        this._refreshToken = deserialized.refresh_token;
        deserialized.refresh_token = 'x';
        sessionStorage.setItem(key, JSON.stringify(deserialized));
    }

    /*
     * Override the removeItem method to also clear the refresh token
     */
    public removeItem(key: string): any {

        sessionStorage.removeItem(key);
        this._refreshToken = '';
    }

    /*
     * Return the length property
     */
    public get length(): number {
        return sessionStorage.length;
    }

    /*
     * Forward to the indexer property of sessionStorage
     */
    public key(index: number): string | null {
        return sessionStorage[index];
    }
}
