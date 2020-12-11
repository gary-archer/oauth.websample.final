/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {

    // The base URL that OIDC Client will use
    authority: string;

    // Our registered client id
    clientId: string;

    // Our registered redirect URI
    redirectUri: string;

    // OAuth scopes
    scope: string;

    // The reverse proxy path used for requests that use refresh tokens
    reverseProxyPath: string;

    // The custom logout endpoint, configured when the provider is AWS Cognito
    customLogoutEndpoint: string;

    // The post logout redirect URI that the Authorixation Server redirects back to
    postLogoutRedirectUri: string;

    // The post logout hash location within our SPA
    postLogoutHashLocation: string;

    // The idp parameter varies by vendor
    idpParameterName: string;
}
