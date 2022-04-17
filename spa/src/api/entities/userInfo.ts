/*
 * Any user info can be returned to the UI
 */
export interface UserInfo {

    // These values originate from OAuth user info
    givenName: string;
    familyName: string;

    // This value originates from the API's own data
    regions: string[];
}
