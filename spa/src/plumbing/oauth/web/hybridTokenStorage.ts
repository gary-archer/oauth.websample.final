/*
 * A hybrid token storage class that saves tokens in memory
 * Multi tab browsing is supported by saving protocol claims to local storage
 * This enables validation checks in OIDC Client to pass across all browser tabs
 */
export class HybridTokenStorage {

    private _accessToken: string;
    private _idToken: string;
    private _refreshToken: string;

    /*
     * There is no refresh token visible in the SPA
     * The dummy value is just to get the OIDC Client library to send refresh token grant messages
     */
    public constructor() {
        this._accessToken = '';
        this._idToken = '';
        this._refreshToken = '-';
    }

    /*
     * Override the setItem method to remote tokens from data stored and to store them in memory instead
     */
    public setItem(key: string, value: any): any {

        // Store the real tokens in memory
        const deserialized = JSON.parse(value);
        this._accessToken = deserialized.access_token;
        this._idToken = deserialized.id_token;

        // Save only protocol claims to local storage
        deserialized.access_token = '';
        deserialized.id_token = '';
        deserialized.refresh_token = this._refreshToken;
        localStorage.setItem(key, JSON.stringify(deserialized));
    }

    /*
     * Override the getItem method to use the in memory tokens, with a dummy value for the refresh token
     */
    public getItem(key: string): any {

        // Load protocol claims from local storage
        const rawData = localStorage.getItem(key);
        if (rawData) {

            // Update with in memory token values
            const deserialized = JSON.parse(rawData);
            deserialized.access_token = this._accessToken;
            deserialized.id_token = this._idToken;
            deserialized.refresh_token = this._refreshToken;
            return JSON.stringify(deserialized);
        }

        return null;
    }

    /*
     * Override the removeItem method to also clear the refresh token
     */
    public removeItem(key: string): any {

        localStorage.removeItem(key);
        this._accessToken = '';
        this._idToken = '';
    }

    /*
     * Return the length property
     */
    public get length(): number {
        return localStorage.length;
    }

    /*
     * Forward to the indexer property
     */
    public key(index: number): string | null {
        return localStorage[index];
    }
}
