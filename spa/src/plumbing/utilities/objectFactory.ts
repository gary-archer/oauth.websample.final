import {ApiClient} from '../../api/client/apiClient';
import {ApiFetch} from '../../api/client/apiFetch';
import {Configuration} from '../../configuration/configuration';
import {Authenticator} from '../oauth/authenticator';
import {AuthenticatorImpl} from '../oauth/authenticatorImpl';
import {SessionManager} from './sessionManager';

/*
 * A class to create global objects on application startup
 */
export class ObjectFactory {

    private _configuration: Configuration;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
    }

    /*
     * Create the authenticator
     */
    public createAuthenticator(): Authenticator {
        return new AuthenticatorImpl(this._configuration.oauth, SessionManager.get());
    }

    /*
     * Create a client for making API calls
     */
    public createApiClient(authenticator: Authenticator): ApiClient {

        const authenticatorImpl = authenticator as AuthenticatorImpl;
        const channel = new ApiFetch(this._configuration.app, SessionManager.get(), authenticatorImpl);
        return new ApiClient(channel);
    }
}
