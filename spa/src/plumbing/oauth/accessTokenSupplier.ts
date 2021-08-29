/*
 * A simple interface used by ApiFetch to do OAuth work
 */
export interface AccessTokenSupplier {

    // Try to get an access token
    getAccessToken(): Promise<string>;

    // Try to refresh the access token when it expires
    refreshAccessToken(): Promise<string>;
}
