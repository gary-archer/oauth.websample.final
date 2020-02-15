/*
 * An adapter class to manage storage of Cognito tokens and work around lack of standards support
 */
export class CognitoWebStorage {

    // Our short lived access token is stored in HTML 5 session storage
    // This trade off prevents end users from having to login every time they refresh the page
    private readonly accessTokenStorageKey = 'basicspa.accesstoken';
    private readonly _data: any = {};

    public constructor() {
        this._data = {};
    }

    /*
     * Override the getItem method to retrieve the access token from session storage
     */
    public getItem(key: string): any {

        const item = this._data[key];
        if (item) {

            const deserialized = JSON.parse(item);
            deserialized.access_token = sessionStorage.getItem(this.accessTokenStorageKey);
            return JSON.stringify(deserialized);
        }

        return null;
    }

    /*
     * Override the setItem method to save the access token from session storage
     */
    public setItem(key: string, value: any): any {

        this._data[key] = value;
        const deserialized = JSON.parse(value);
        sessionStorage.setItem(this.accessTokenStorageKey, deserialized.access_token);
    }

    /*
     * Override the removeItem method to remove the access token from session storage
     */
    public removeItem(key: string): any {

        delete this._data[key];
        sessionStorage.removeItem(this.accessTokenStorageKey);
    }

    /*
     * Return the length property
     */
    public get length(): number {
        return Object.getOwnPropertyNames(this._data).length;
    }

    /*
     * Forward to the indexer property of sessionStorage
     */
    public key(index: number): string | null {
        return Object.getOwnPropertyNames(this._data)[index];
    }
}
