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

    // If set then requests that would otherwise use refresh tokens are routed via a web reverse proxy 
    reverseProxyPath: string;

    // The custom logout endpoint, configured when the provider is AWS Cognito
    customLogoutEndpoint: string;

    // The post logout redirect URI that the Authorixation Server redirects back to
    postLogoutRedirectUri: string;

    // The idp parameter varies by vendor
    idpParameterName: string;
}
