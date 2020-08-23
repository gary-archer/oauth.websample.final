/*
 * A holder for CDN configuration settings
 */
export interface ContentDeliveryNetworkConfiguration {

    // Details we will write to the Content Security Policy header for connect-src
    contentSecurityPolicyHosts: string[];

    // By default we disable applying headers for web.mycompany.com on a developer PC
    // This prevents problems with a cached CSPs and other code samples or configurations
    enabled: boolean;
}
