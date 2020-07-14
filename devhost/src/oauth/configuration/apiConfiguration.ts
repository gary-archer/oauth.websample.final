/*
 * API specific settings
 */
export interface ApiConfiguration {
    sslCertificateFileName: string;
    sslCertificatePassword: string;
    sslPort: number;
    useProxy: boolean;
    proxyUrl: string;
    webTrustedOrigins: string[];
}
