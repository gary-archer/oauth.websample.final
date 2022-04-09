import {Configuration} from './configuration';

/*
 * This is the only environment hard coded into the app
 */
export const productionConfiguration = {

    app: {
        webOrigin: 'https://web.authsamples.com',
        apiBaseUrl: 'https://tokenhandler.authsamples.com/api'
    },
    oauth: {
        oauthAgentBaseUrl: 'https://tokenhandler.authsamples.com/oauth-agent',
    }
} as Configuration;
