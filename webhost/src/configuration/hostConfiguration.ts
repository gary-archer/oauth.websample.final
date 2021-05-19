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

    // Mode is development when running on a Developer PC
    mode: string;
}
