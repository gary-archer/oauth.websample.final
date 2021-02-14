import {UserManagerSettings} from 'oidc-client';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';

/*
 * Details provided to the web authenticator
 */
export interface WebAuthenticatorOptions {

    settings: UserManagerSettings;

    configuration: OAuthConfiguration;

    webBaseUrl: string;

    onLoggedOut: () => void;
}
