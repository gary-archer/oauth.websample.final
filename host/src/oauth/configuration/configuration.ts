import {ApiConfiguration} from './apiConfiguration';
import {OAuthConfiguration} from './oauthConfiguration';
import {WebConfiguration} from './webConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {
    api: ApiConfiguration;
    web: WebConfiguration;
    oauth: OAuthConfiguration;
}
