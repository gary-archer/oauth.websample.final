import {ApiConfiguration} from './apiConfiguration';
import {OAuthConfiguration} from './oauthConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {
    api: ApiConfiguration;
    oauth: OAuthConfiguration;
}
