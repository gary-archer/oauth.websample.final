import {Configuration} from './configuration';

/*
 * This deployment points to Serverless APIs
 */
export const productionServerlessConfiguration = {

    app: {
        webOrigin: 'https://web.authsamples.com',
        apiBaseUrl: 'https://api.authsamples.com/demobrand/investments'
    },
    oauth: {
        oauthAgentBaseUrl: 'https://api.authsamples.com/demobrand/oauth-agent',
    }
} as Configuration;

/*
 * This deployment points to APIs running a Kubernetes cluster
 */
export const productionCloudNativeConfiguration = {

    app: {
        webOrigin: 'https://web.authsamples-k8s.com',
        apiBaseUrl: 'https://api.authsamples-k8s.com/demobrand/investments'
    },
    oauth: {
        oauthAgentBaseUrl: 'https://api.authsamples-k8s.com/demobrand/oauth-agent',
    }
} as Configuration;