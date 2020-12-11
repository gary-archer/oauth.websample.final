/*
 * User info claims can be returned to the UI or used if the API triggers sending of emails to users
 */
export interface UserInfoClaims {
    givenName: string;
    familyName: string;
    email: string;
}
