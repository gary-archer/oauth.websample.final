/*
 * A holder for CDN configuration settings
 */
export interface ContentDeliveryNetworkConfiguration {

    // Details we will write to the Content Security Policy header for connect-src
    contentSecurityPolicyHosts: string[];

    // These hosts are only to avoid developer PC problems when running other configurations
    otherTrustedHosts: string[];
}
