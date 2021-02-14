/*
 * A hybrid token storage class that saves tokens only in memory in private class members
 * This makes user state available in new browser tabs so that ExtendedUserManager token refresh works
 */
export class HybridTokenStorage {

    private _accessToken: string;
    private _refreshToken: string;
    private _idToken: string;

    public constructor() {
        this._accessToken = '';
        this._refreshToken = '';
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
     * Override the removeItem method to also clear tokens
     */
    public removeItem(key: string): any {

        localStorage.removeItem(key);
        this._accessToken = '';
        this._refreshToken = '';
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

        // Save the updated access token
        this._accessToken = tokenData.access_token;

        // If there is a new refresh token then save it, otherwise maintain the existing one
        if (tokenData.refresh_token) {
            this._refreshToken = tokenData.refresh_token;
        }

        // If there is a new id token then save it, otherwise maintain the existing one
        if (tokenData.id_token) {
            this._idToken = tokenData.id_token;
        }

        // Remove tokens from HTML storage
        delete tokenData.access_token;
        delete tokenData.id_token;
        delete tokenData.refresh_token;

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

        tokenData.access_token = this._accessToken;
        tokenData.id_token = this._idToken;
        tokenData.refresh_token = this._refreshToken;
    }
}
