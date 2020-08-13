/*
 * A holder for configuration settings
 */
export interface WebReverseProxyConfiguration {

    // The token endpoint from which we get refresh tokens
    tokenEndpoint: string;

    // The encryption key for cookies
    cookieEncryptionKey: string;

    // The root domain of the refresh token cookie
    cookieRootDomain: string;

    // The web origin we accept requests from
    trustedWebOrigin: string;
}
