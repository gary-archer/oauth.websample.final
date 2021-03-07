/*
 * Configure behaviour of security headers
 */
export interface SecurityHeaderConfiguration {

    // By default we disable applying headers for web.mycompany.com on a developer PC
    // This prevents problems where the cached CSP conflicts with other code samples
    enabled: boolean;

    // Details we will write to the Content Security Policy header for connect-src
    contentSecurityPolicyHosts: string[];
}
