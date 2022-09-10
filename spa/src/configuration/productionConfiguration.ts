import {Configuration} from './configuration';

/*
 * This deployment points to Serverless APIs
 */
export const productionServerlessConfiguration = {

    app: {
        webOrigin: 'https://web.authsamples.com',
        apiBaseUrl: 'https://tokenhandler.authsamples.com/api'
    },
    oauth: {
        oauthAgentBaseUrl: 'https://tokenhandler.authsamples.com/oauth-agent',
    }
} as Configuration;

/*
 * This deployment points to APIs running a Kubernetes cluster
 */
export const productionCloudNativeConfiguration = {

    app: {
        webOrigin: 'https://web.authsamples-k8s.com',
        apiBaseUrl: 'https://tokenhandler.authsamples-k8s.com/api'
    },
    oauth: {
        oauthAgentBaseUrl: 'https://tokenhandler.authsamples-k8s.com/oauth-agent',
    }
} as Configuration;
