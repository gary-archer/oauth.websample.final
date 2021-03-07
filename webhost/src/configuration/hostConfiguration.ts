/*
 * A holder for host configuration settings
 */
export interface HostConfiguration {

    // SSL listener details
    sslCertificateFileName: string;
    sslCertificatePassword: string;
    sslPort: number;

    // HTTP debugging details
    useHttpProxy: boolean;
    httpProxyUrl: string;
}
