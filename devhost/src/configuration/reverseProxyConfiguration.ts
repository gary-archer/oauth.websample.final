/*
 * A holder for configuration settings
 */
export interface ReverseProxyConfiguration {

    // The token endpoint from which we get refresh tokens
    tokenEndpoint: string;

    // The encryption key for cookies
    cookieEncryptionKey: string;

    // The web origin we accept requests from
    trustedWebOrigin: string;
}
