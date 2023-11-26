import {Configuration} from './configuration';

/*
 * This deployment points to Serverless APIs
 */
export const productionServerlessConfiguration = {
    apiBaseUrl: 'https://api.authsamples.com/demobrand/investments',
    oauthAgentBaseUrl: 'https://api.authsamples.com/demobrand/oauth-agent',
} as Configuration;

/*
 * This deployment points to APIs running a Kubernetes cluster
 */
export const productionCloudNativeConfiguration = {
    apiBaseUrl: 'https://api.authsamples-k8s.com/demobrand/investments',
    oauthAgentBaseUrl: 'https://api.authsamples-k8s.com/demobrand/oauth-agent',
} as Configuration;
