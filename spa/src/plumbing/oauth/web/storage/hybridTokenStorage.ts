/*
 * A hybrid token storage class that saves tokens only in memory in private class members
 * Multi tab browsing is supported by saving protocol claims to local storage
 * This enables validation checks in OIDC Client to pass across all browser tabs
 */
export class HybridTokenStorage {

    private _accessToken: string;
    private _idToken: string;

    public constructor() {
        this._accessToken = '';
        this._idToken = '';
    }

    /*
     * Customise token storage after login, so that sensitive data is only in memory
     */
    public setItem(key: string, value: any): any {

        // Store the real tokens in memory
        const deserialized = JSON.parse(value);
        this._removeSensitiveDataWhenStoring(deserialized);

        // Save protocol claims to local storage, needed to support page refreshes and multi tab browsing
        localStorage.setItem(key, JSON.stringify(deserialized));
    }

    /*
     * When UserManager.getUser is called, this supplies tokens from memory
     */
    public getItem(key: string): any {

        // Load protocol claims from local storage
        const rawData = localStorage.getItem(key);
        if (rawData) {

            // Update with in memory token values
            const deserialized = JSON.parse(rawData);
            this._setSensitiveDataWhenLoading(deserialized);
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

    /*
     * Return the id token for use during logout
     */
    public getIdToken(): string {
        return this._idToken;
    }

    /*
     * Avoid storing tokens in local storage
     */
    private _removeSensitiveDataWhenStoring(tokenData: any) {

        // Save tokens to in memory class members
        this._accessToken = tokenData.access_token;
        this._idToken = tokenData.id_token;

        // Remove tokens from HTML storage
        delete tokenData.access_token;
        delete tokenData.id_token;

        if (tokenData.profile) {

            // Also remove profile claims from the id token, since our SPA gets this data from our API
            delete tokenData.profile.given_name;
            delete tokenData.profile.family_name;
            delete tokenData.profile.email;

            // Some providers also supply this value
            if (tokenData.profile.preferred_username) {
                delete tokenData.profile.preferred_username;
            }
        }
    }

    /*
     * Return our in memory tokens to the OIDC Client library
     */
    private _setSensitiveDataWhenLoading(tokenData: any) {

        // Set token values
        tokenData.access_token = this._accessToken;
        tokenData.id_token = this._idToken;

        // This ensures that OIDC Client silently renews tokens via a refresh token grant message
        // It also ensures that OIDC Client never attempts to use iframe based token renewal
        tokenData.refresh_token = '-';
    }
}
