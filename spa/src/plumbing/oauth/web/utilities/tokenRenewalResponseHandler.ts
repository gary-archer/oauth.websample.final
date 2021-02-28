import {UserManager} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../../../configuration/oauthConfiguration';

/*
 * Receive iframe token renewal responses
 */
export class TokenRenewalResponseHandler {

    private readonly _userManager: UserManager;

    public constructor(configuration: OAuthConfiguration) {

        const settings = {
            authority: configuration.authority,
            client_id: configuration.clientId,
        };

        this._userManager = new UserManager(settings);
    }

    /*
     * Handle token renewal responses from the authorization server
     */
    public async handleSilentTokenRenewalResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            // Start processing of the authorization response on the iframe
            // Any errors are reported via the authenticator class of the main window
            await this._userManager.signinSilentCallback();
        }
    }
}
