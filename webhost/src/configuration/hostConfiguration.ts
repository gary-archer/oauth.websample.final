/*
 * A holder for host configuration settings
 */
export interface HostConfiguration {

    // The port to listen on
    port: number;

    // The path to the SSL certificate P12 file
    sslCertificateFileName: string;

    // The SSL certificate's private key password
    sslCertificatePassword: string;

    // Whether to use an HTTPS proxy
    useHttpProxy: boolean;

    // The proxy URL when used
    httpProxyUrl: string;

    // Mode is development when running on a Developer PC
    mode: string;
}
