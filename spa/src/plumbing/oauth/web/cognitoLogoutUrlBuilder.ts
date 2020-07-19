import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';

/*
 * A helper class to build the logout URL for Cognito in a vendor specific manner
 * https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
 */
export class CognitoLogoutUrlBuilder {

    private readonly _configuration: OAuthConfiguration;

    public constructor(configuration: OAuthConfiguration) {
        this._configuration = configuration;
    }

    /*
     * Format the vendor specific logout URL
     */
    public buildUrl(): string {

        // Cognito requires the configured logout return URL to use a path segment, so we use /loggedout.html
        const clientId = encodeURIComponent(this._configuration.clientId);
        const logoutReturnUri = encodeURIComponent(`${this._configuration.appUri}/loggedout.html`);

        // Upon return, loggedout.html redirects to https://web.authguidance-examples.com/spa/#/loggedout
        return `${this._configuration.logoutEndpoint}?client_id=${clientId}&logout_uri=${logoutReturnUri}`;
    }
}
