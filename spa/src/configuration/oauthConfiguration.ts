/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {
    authority: string;
    clientId: string;
    appUri: string;
    postLogoutPath: string;
    logoutEndpoint: string;
    scope: string;
}
