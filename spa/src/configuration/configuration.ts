import {AppConfiguration} from './appConfiguration';
import {OAuthConfiguration} from './oauthConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {

    // Application specific settings
    app: AppConfiguration;

    // Settings that could be passed into an SPA OAuth helper library
    oauth: OAuthConfiguration;
}
