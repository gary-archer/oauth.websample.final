/*
 * A holder for configuration settings for the simple web host
 */
export interface Configuration {
    port: number;
    sslCertificateFileName: string;
    sslCertificatePassword: string;
    trustedHosts: string[];
    addResponseCacheHeaders: boolean;
}
