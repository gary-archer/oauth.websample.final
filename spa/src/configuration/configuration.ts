import {AppConfiguration} from './appConfiguration';
import {OAuthConfiguration} from './oauthConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {
    app: AppConfiguration;
    oauth: OAuthConfiguration;
}
