import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {ApiCoordinator} from '../../api/client/apiCoordinator';
import {ApiUserInfo} from '../../api/entities/apiUserInfo';
import {BaseErrorFactory, UIError} from '../../plumbing/errors/lib';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {OAuthUserInfo} from '../../plumbing/oauth/oauthUserInfo';
import {HttpRequestNames} from '../../plumbing/http/httpRequestNames';

/*
 * The view model for the user info view
 */
export class UserInfoViewModel {

    private readonly _authenticator: Authenticator;
    private readonly _apiClient: ApiClient;
    private readonly _eventBus: EventBus;
    private readonly _apiCoordinator: ApiCoordinator;
    private _oauthUserInfo: OAuthUserInfo | null;
    private _apiUserInfo: ApiUserInfo | null;
    private _error: UIError | null;

    public constructor(
        authenticator: Authenticator,
        apiClient: ApiClient,
        eventBus: EventBus,
        apiCoordinator: ApiCoordinator,
    ) {
        this._authenticator = authenticator;
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._apiCoordinator = apiCoordinator;
        this._oauthUserInfo = null;
        this._apiUserInfo = null;
        this._error = null;
    }

    /*
     * Property accessors
     */
    public get oauthUserInfo(): OAuthUserInfo | null {
        return this._oauthUserInfo;
    }

    public get apiUserInfo(): ApiUserInfo | null {
        return this._apiUserInfo;
    }

    public get error(): UIError | null {
        return this._error;
    }

    public get eventBus(): EventBus {
        return this._eventBus;
    }

    /*
     * Get data from the API and then notify the caller
     */
    public async callApi(options?: ApiClientOptions): Promise<void> {

        this._apiCoordinator.onViewLoading(HttpRequestNames.UserInfo);
        this._error = null;

        try {

            // The UI gets OAuth user info from the authorization server
            const oauthUserInfoPromise = this._authenticator.getUserInfo();

            // The UI gets domain specific user attributes from its API
            const apiUserInfoPromise = this._apiClient.getUserInfo(options);

            // Run the tasks in parallel
            const results = await Promise.all([oauthUserInfoPromise, apiUserInfoPromise]);
            const oauthUserInfo = results[0];
            const apiUserInfo = results[1];

            // Update data
            if (oauthUserInfo) {
                this._oauthUserInfo = oauthUserInfo;
            }
            if (apiUserInfo) {
                this._apiUserInfo = apiUserInfo;
            }

        } catch (e: any) {

            // Report errors
            this._error = BaseErrorFactory.fromException(e);
            this._oauthUserInfo = null;
            this._apiUserInfo = null;

        } finally {

            this._apiCoordinator.onViewLoaded(HttpRequestNames.UserInfo);
        }
    }
}
