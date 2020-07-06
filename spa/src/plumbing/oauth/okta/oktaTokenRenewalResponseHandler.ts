import {UserManager} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';

/*
 * A simple class to manage token renewal
 */
export class OktaTokenRenewalResponseHandler {

    // The OIDC Client class does all of the real security processing
    private readonly _userManager: UserManager;

    /*
     * Initialise OAuth settings and create the UserManager
     */
    public constructor(configuration: OAuthConfiguration) {

        const settings = {
            authority: configuration.authority,
            client_id: configuration.clientId,
            redirect_uri: configuration.appUri,
            scope: configuration.scope,
            response_type: 'code',
            loadUserInfo: false,
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
            // Any errors are reported via the main window's onSilentTokenRenewalError callback
            await this._userManager.signinSilentCallback();
        }
    }
}
