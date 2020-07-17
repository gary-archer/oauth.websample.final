/*
 * A holder for configuration settings
 */
export interface Configuration {

    // SSL listener details
    sslCertificateFileName: string;
    sslCertificatePassword: string;
    sslPort: number;

    // The token endpoint from which we get refresh tokens
    tokenEndpoint: string;

    // The encryption key for cookies
    cookieEncryptionKey: string;

    // Web origins we accept requests from
    trustedWebOrigins: string[];

    // HTTP debugging details
    useHttpProxy: boolean;
    httpProxyUrl: string;
}
