import {Configuration} from './configuration';

/*
 * This deployment points to Serverless APIs
 */
export const productionServerlessConfiguration = {
    apiBaseUrl: 'https://bff.authsamples.com/investments',
    oauthAgentBaseUrl: 'https://bff.authsamples.com/oauth-agent',
} as Configuration;

/*
 * This deployment points to APIs running a Kubernetes cluster
 */
export const productionCloudNativeConfiguration = {
    apiBaseUrl: 'https://bff.authsamples-k8s.com/investments',
    oauthAgentBaseUrl: 'https://bff.authsamples-k8s.com/oauth-agent',
} as Configuration;
