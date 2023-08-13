import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {ApiUserInfo} from '../../api/entities/apiUserInfo';
import {BaseErrorFactory, UIError} from '../../plumbing/errors/lib';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {OAuthUserInfo} from '../../plumbing/oauth/oauthUserInfo';
import {ApiViewEvents} from '../utilities/apiViewEvents';
import {ApiViewNames} from '../utilities/apiViewNames';

/*
 * The view model for the user info view
 */
export class UserInfoViewModel {

    private readonly _authenticator: Authenticator;
    private readonly _apiClient: ApiClient;
    private readonly _eventBus: EventBus;
    private readonly _apiViewEvents: ApiViewEvents;
    private _oauthUserInfo: OAuthUserInfo | null;
    private _apiUserInfo: ApiUserInfo | null;

    public constructor(
        authenticator: Authenticator,
        apiClient: ApiClient,
        eventBus: EventBus,
        apiViewEvents: ApiViewEvents,
    ) {
        this._authenticator = authenticator;
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._apiViewEvents = apiViewEvents;
        this._oauthUserInfo = null;
        this._apiUserInfo = null;
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

    public get eventBus(): EventBus {
        return this._eventBus;
    }

    /*
     * Get data from the API and then notify the caller
     */
    public async callApi(
        onSuccess: (oauthUserInfo: OAuthUserInfo, apiUserInfo: ApiUserInfo) => void,
        onError: (error: UIError) => void,
        options?: ApiClientOptions): Promise<void> {

        try {

            this._apiViewEvents.onViewLoading(ApiViewNames.UserInfo);

            // The UI gets OAuth user info from the authorization server
            const oauthUserInfoPromise = this._authenticator.getUserInfo();

            // The UI gets domain specific user attributes from its API
            const apiUserInfoPromise = this._apiClient.getUserInfo(options);

            // Run the tasks in parallel
            const results = await Promise.all([oauthUserInfoPromise, apiUserInfoPromise]);
            const oauthUserInfo = results[0];
            const apiUserInfo = results[1];

            // Update views
            this._apiViewEvents.onViewLoaded(ApiViewNames.UserInfo);
            if (apiUserInfo) {
                onSuccess(oauthUserInfo, apiUserInfo);
            }

        } catch (e: any) {

            // Report errors
            const error = BaseErrorFactory.fromException(e);
            this._apiViewEvents.onViewLoadFailed(ApiViewNames.UserInfo, error);
            onError(error);
        }
    }
}
