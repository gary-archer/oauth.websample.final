/*
 * A holder for configuration settings
 */
export interface Configuration {

    // The token endpoint from which we get refresh tokens
    tokenEndpoint: string;

    // Cookie details
    cookieRootDomain: string;
    cookieEncryptionKey: string;

    // The web origin we accept requests from
    trustedWebOrigin: string;

    // For local development, support mock responses from the Authorization Server
    useMockResponses: boolean;

    // HTTP debugging details when running on a developer PC via sls invoke
    useHttpProxy: boolean;
    httpProxyUrl: string;
}
