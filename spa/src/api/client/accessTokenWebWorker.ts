import {expose} from 'comlink';
import {Configuration} from '../../configuration/configuration';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {WebAuthenticatorEvents} from '../../plumbing/oauth/web/webAuthenticatorEvents';
import {WebWorkerAuthenticator} from '../../plumbing/oauth/web/webWorkerAuthenticator';
import {ApiFetch} from './apiFetch';
import {ApiFetchOptions} from './apiFetchOptions';
import {Channel} from './channel';

/*
 * The web worker is used to isolate access tokens, meaning all API requests are made in the web worker
 * This class is the entry point exposed by comlink, and is called from the main side of the app
 */
export class AccessTokenWebWorker implements Channel, WebAuthenticatorEvents {

    private readonly _authenticator: WebWorkerAuthenticator;
    private readonly _fetcher: ApiFetch;

    /*
     * The web worker creates its own copies of objects from the data supplied
     */
    public constructor(configuration: Configuration, sessionId: string) {

        this._authenticator = new WebWorkerAuthenticator(configuration.oauth, sessionId);
        this._fetcher = new ApiFetch(configuration.app, sessionId, this._authenticator);
    }

    /*
     * A parameterized fetch method is the main method called from the main side of the app
     */
    public async fetch(options: ApiFetchOptions): Promise<any> {

        try {

            // Try the API call
            return await this._fetcher.fetch(options);

        } catch (e) {

            // Throw a plain data object back to the main part of the app
            const error = ErrorHandler.getFromException(e);
            throw error.toData();
        }
    }

    /*
     * Receive a new anti forgery token whenever the SPA loads
     */
    public async onPageLoad(antiForgeryToken: string): Promise<void> {
        this._authenticator.onPageLoad(antiForgeryToken);
    }

    /*
     * Clear the access token stored in the authenticator
     */
    public async onClearAccessToken(): Promise<void> {
        this._authenticator.onClearAccessToken();
    }

    /*
     * For testing, make the access token stored in the authenticator act expired
     */
    public async onExpireAccessToken(): Promise<void> {
        this._authenticator.onExpireAccessToken();
    }

    /*
     * Clean up upon logout
     */
    public async onLogout(): Promise<void> {
        this._authenticator.onLogout();
    }
}

expose(AccessTokenWebWorker);
