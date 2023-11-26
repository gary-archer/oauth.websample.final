import EventBus from 'js-event-bus';
import {Dispatch, SetStateAction, useState} from 'react';
import {FetchCacheKeys} from '../../api/client/fetchCacheKeys';
import {FetchClient} from '../../api/client/fetchClient';
import {ApiUserInfo} from '../../api/entities/apiUserInfo';
import {OAuthUserInfo} from '../../api/entities/oauthUserInfo';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {ViewModelCoordinator} from '../utilities/viewModelCoordinator';

/*
 * The view model for the user info view
 */
export class UserInfoViewModel {

    private readonly _fetchClient: FetchClient;
    private readonly _eventBus: EventBus;
    private readonly _viewModelCoordinator: ViewModelCoordinator;
    private _oauthUserInfo: OAuthUserInfo | null;
    private _apiUserInfo: ApiUserInfo | null;
    private _error: UIError | null;
    private _setOAuthUserInfo: Dispatch<SetStateAction<OAuthUserInfo | null>> | null;
    private _setApiUserInfo: Dispatch<SetStateAction<ApiUserInfo | null>> | null;
    private _setError: Dispatch<SetStateAction<UIError | null>> | null;

    public constructor(
        fetchClient: FetchClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this._fetchClient = fetchClient;
        this._eventBus = eventBus;
        this._viewModelCoordinator = viewModelCoordinator;
        this._oauthUserInfo = null;
        this._apiUserInfo = null;
        this._error = null;
        this._setOAuthUserInfo = null;
        this._setApiUserInfo = null;
        this._setError = null;
    }

    /*
     * For the correct React behavior, the view initializes state every time it loads
     */
    public useState(): void {

        const [, setOAuthUserInfo] = useState(this._oauthUserInfo);
        this._setOAuthUserInfo = setOAuthUserInfo;

        const [, setApiUserInfo] = useState(this._apiUserInfo);
        this._setApiUserInfo = setApiUserInfo;

        const [, setError] = useState(this._error);
        this._setError = setError;
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
    public async callApi(options?: ViewLoadOptions): Promise<void> {

        const oauthFetchOptions = {
            cacheKey: FetchCacheKeys.OAuthUserInfo,
            forceReload: options?.forceReload || false,
            causeError: options?.causeError || false,
        };

        const apiFetchOptions = {
            cacheKey: FetchCacheKeys.ApiUserInfo,
            forceReload: options?.forceReload || false,
            causeError: options?.causeError || false,
        };

        this._viewModelCoordinator.onUserInfoViewModelLoading();
        this._updateError(null);

        try {

            // Set up promises for the two sources of user info
            const oauthUserInfoPromise = this._fetchClient.getOAuthUserInfo(oauthFetchOptions);
            const apiUserInfoPromise = this._fetchClient.getApiUserInfo(apiFetchOptions);

            // Run the tasks in parallel
            const results = await Promise.all([oauthUserInfoPromise, apiUserInfoPromise]);
            const oauthUserInfo = results[0];
            const apiUserInfo = results[1];

            // Update data
            if (oauthUserInfo) {
                this._updateOAuthUserInfo(oauthUserInfo);
            }
            if (apiUserInfo) {
                this._updateApiUserInfo(apiUserInfo);
            }

        } catch (e: any) {

            this._updateError(ErrorFactory.fromException(e));
            this._updateOAuthUserInfo(null);
            this._updateApiUserInfo(null);

        } finally {

            this._viewModelCoordinator.onUserInfoViewModelLoaded();
        }
    }

    /*
     * Unload when the user navigates to login required
     */
    public unload(): void {
        this._updateOAuthUserInfo(null);
        this._updateApiUserInfo(null);
        this._updateError(null);
    }

    /*
     * Reload when the user navigates from login required
     */
    public async reload(): Promise<void> {
        await this.callApi();
    }

    /*
     * Update state and the binding system
     */
    private _updateOAuthUserInfo(oauthUserInfo: OAuthUserInfo | null): void {
        this._oauthUserInfo = oauthUserInfo;
        this._setOAuthUserInfo!(oauthUserInfo);
    }

    /*
     * Update state and the binding system
     */
    private _updateApiUserInfo(apiUserInfo: ApiUserInfo | null): void {
        this._apiUserInfo = apiUserInfo;
        this._setApiUserInfo!(apiUserInfo);
    }

    /*
     * Update state and the binding system
     */
    private _updateError(error: UIError | null): void {
        this._error = error;
        this._setError!(error);
    }
}
