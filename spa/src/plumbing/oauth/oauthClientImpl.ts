import {Configuration} from '../../configuration/configuration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorFactory} from '../errors/errorFactory';
import {UIError} from '../errors/uiError';
import {ConcurrentActionHandler} from '../utilities/concurrentActionHandler';
import {HtmlStorageHelper} from '../utilities/htmlStorageHelper';
import {OAuthClient} from './oauthClient';
import {EndLoginResponse} from './endLoginResponse';

/*
 * The OAuth client implementation
 */
export class OAuthClientImpl implements OAuthClient {

    private readonly configuration: Configuration;
    private readonly concurrencyHandler: ConcurrentActionHandler;

    public constructor(configuration: Configuration) {

        this.configuration = configuration;
        this.concurrencyHandler = new ConcurrentActionHandler();
        this.setupCallbacks();
    }

    /*
     * Use the value in storage as an indicator of whether logged in
     */
    public isLoggedIn(): boolean {
        return !!HtmlStorageHelper.getIsLoggedIn();
    }

    /*
     * Trigger the login redirect to the authorization server
     */
    public async login(currentLocation: string): Promise<void> {

        try {

            // Call the API to set up the login
            const response = await this.callOAuthAgent('POST', 'login/start', null, true);

            // Store the app location before the login redirect
            HtmlStorageHelper.setPreLoginLocation(currentLocation);

            // Then redirect the main window
            location.href = response.authorizationRequestUrl;

        } catch (e) {

            throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Check for and handle login responses when the page loads
     */
    public async handlePageLoad(): Promise<string | null> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        if (location.search) {

            const args = new URLSearchParams(location.search);
            const state = args.get('state');
            if (state) {

                try {

                    // Send the full URL to the OAuth agent API
                    const body = {
                        pageUrl: location.href,
                    };
                    const response = await this.callOAuthAgent('POST', 'login/end', body, true) as EndLoginResponse;

                    // Check for expected data in the response
                    if (!response.handled) {
                        throw ErrorFactory.fromInvalidLoginResponse();
                    }

                    // Store post login details
                    HtmlStorageHelper.setIsLoggedIn(true);
                    HtmlStorageHelper.setDelegationId(response.claims[this.configuration.delegationIdClaimName] || '');

                    // Once login is complete, return the SPA to the pre-login location
                    return HtmlStorageHelper.getAndRemovePreLoginLocation() || '/';

                } catch (e: any) {

                    // Handle errors that we want to treat as non-errors to avoid user issues
                    // These include cookies with an old encryption key or invalid authorization responses
                    // API calls will then fail and a new login redirect will be triggered, to get updated cookies
                    if (this.isSessionExpiredError(e)) {
                        return null;
                    }

                    // Rethrow other errors
                    throw ErrorFactory.fromLoginOperation(e, ErrorCodes.loginResponseFailed);
                }
            }
        }

        // Return a no-op result by default
        return null;
    }

    /*
     * Do the logout redirect to clear all cookie and token details
     */
    public async logout(): Promise<void> {

        try {

            const response = await this.callOAuthAgent('POST', 'logout', null, true);
            this.clearLoginState();
            location.href = response.url;

        } catch (e) {

            throw ErrorFactory.fromLogoutOperation(e, ErrorCodes.logoutRequestFailed);
        }
    }

    /*
     * Clear the login state when the session ends
     */
    public clearLoginState(): void {
        HtmlStorageHelper.clearIsLoggedIn();
        HtmlStorageHelper.clearDelegationId();
    }

    /*
     * Synchronize a refresh call to the OAuth agent, which will rewrite cookies
     */
    public async synchronizedRefresh(): Promise<void> {
        await this.concurrencyHandler.execute(this.performTokenRefresh);
    }

    /*
     * This method is for testing only, so that the SPA can simulate expired access tokens
     */
    public async expireAccessToken(): Promise<void> {

        try {

            // Rewrite the access token within the cookie, using existing cookies as the request credential
            await this.callOAuthAgent('POST', 'access/expire', null, false);

        } catch (e: any) {

            // Session expired errors are silently ignored
            if (!this.isSessionExpiredError(e)) {
                throw ErrorFactory.fromTestExpiryError(e, 'access');
            }
        }
    }

    /*
     * This method is for testing only, so that the SPA can simulate expired refresh tokens
     */
    public async expireRefreshToken(): Promise<void> {

        try {

            // Rewrite the refresh token within the cookie, using the existing cookies as the request credential
            await this.callOAuthAgent('POST', 'refresh/expire', null, false);

        } catch (e: any) {

            // Session expired errors are silently ignored
            if (!this.isSessionExpiredError(e)) {
                throw ErrorFactory.fromTestExpiryError(e, 'refresh');
            }
        }
    }

    /*
     * Do the work of asking the OAuth agent API to refresh the access token stored in the secure cookie
     */
    private async performTokenRefresh(): Promise<void> {

        try {

            await this.callOAuthAgent('POST', 'refresh', null, false);

        } catch (e: any) {

            if (e.statusCode === 401) {
                this.clearLoginState();
                throw ErrorFactory.fromLoginRequired();
            }

            throw ErrorFactory.fromTokenRefreshError(e);
        }
    }

    /*
     * A parameterized method for calling the OAuth agent
     */
    private async callOAuthAgent(
        method: string,
        operationPath: string,
        dataToSend: any,
        readResponse: boolean): Promise<any> {

        // Set the full URL
        const url = `${this.configuration.bffBaseUrl}/oauth-agent/${operationPath}`;

        // Add the token-handler-version custom header, which ensures CORS preflights
        const headers: HeadersInit = {
            'accept': 'application/json',
            'token-handler-version': '1',
            'correlation-id': crypto.randomUUID(),
        };

        // Use the credentials option to send same-site cross-origin cookies to the token handler
        const options: RequestInit = {
            method,
            credentials: 'include',
            headers,
        };

        // Send JSON data if required
        if (dataToSend) {
            headers['content-type'] = 'application/json';
            options.body = JSON.stringify(dataToSend);
        }

        try {

            // Try the request
            const response = await fetch(url, options);
            if (!response.ok) {

                // Handle error responses
                throw await ErrorFactory.getFromApiResponseError(response, 'OAuth agent');

            } else {

                // Return response data if required
                if (readResponse) {
                    return await response.json();
                }
            }

        } catch (e: any) {

            // Handle connection errors
            throw ErrorFactory.getFromFetchError(e, url, 'OAuth agent');
        }
    }

    /*
     * When operations fail due to invalid cookies, the OAuth proxy will return a 401 during API calls
     * This could also be caused by a new cookie encryption key or a redeployment of the Authorization Server
     */
    private isSessionExpiredError(e: any): boolean {

        const uiError = e as UIError;
        return uiError.getStatusCode() === 401;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private setupCallbacks(): void {
        this.performTokenRefresh = this.performTokenRefresh.bind(this);
    }
}
