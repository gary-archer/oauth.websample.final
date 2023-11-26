import {Configuration} from './configuration';

/*
 * This deployment points to Serverless APIs
 * Due to AWS API gateway limitations the SPA routes to the API via a /tokenhandler path
 */
export const productionServerlessConfiguration = {
    apiBaseUrl: 'https://api.authsamples.com/tokenhandler/investments',
    oauthAgentBaseUrl: 'https://api.authsamples.com/tokenhandler/oauth-agent',
} as Configuration;

/*
 * This deployment points to APIs running a Kubernetes cluster
 * The cloud native API gateway does cookie processing then forwards a JWT access token to APIs
 */
export const productionCloudNativeConfiguration = {
    apiBaseUrl: 'https://api.authsamples-k8s.com/investments',
    oauthAgentBaseUrl: 'https://api.authsamples-k8s.com/oauth-agent',
} as Configuration;
