import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {UrlHelper} from '../../utilities/urlHelper';

/*
 * A helper class to build the logout URL for Cognito in a vendor specific manner
 * https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
 */
export class CognitoLogoutUrlBuilder {

    private readonly _configuration: OAuthConfiguration;
    private readonly _webBaseUrl: string;

    public constructor(webBaseUrl: string, configuration: OAuthConfiguration) {
        this._configuration = configuration;
        this._webBaseUrl = webBaseUrl;
    }

    /*
     * Format the vendor specific logout URL
     */
    public buildUrl(): string {

        // Form the full logout redirect URI
        const clientId = encodeURIComponent(this._configuration.clientId);
        const logoutPath = UrlHelper.append(this._webBaseUrl, this._configuration.postLogoutRedirectUri);
        const postLogoutReturnUri = encodeURIComponent(logoutPath);

        // Upon return, loggedout.html redirects to https://web.authsamples.com/spa/#/loggedout
        return `${this._configuration.customLogoutEndpoint}?client_id=${clientId}&logout_uri=${postLogoutReturnUri}`;
    }
}
