/*
 * A holder for configuration settings
 */
export interface Configuration {

    // The base URL to the SPA
    webBaseUrl: string;

    // The base URL to the OAuth proxy API called by the SPA
    oauthProxyApiBaseUrl: string;

    // The base URL to the API called by the SPA
    apiBaseUrl: string;
