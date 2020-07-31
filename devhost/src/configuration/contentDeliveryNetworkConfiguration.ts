/*
 * A holder for CDN configuration settings
 */
export interface ContentDeliveryNetworkConfiguration {

    // Details we will write to the Content Security Policy header for connect-src
    contentSecurityPolicyHosts: string[];
}
