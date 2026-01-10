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
 * The user info view model manages API state
 */
export class UserInfoViewModel {

    private readonly fetchClient: FetchClient;
    private readonly eventBus: EventBus;
    private readonly viewModelCoordinator: ViewModelCoordinator;
    private oauthUserInfo: OAuthUserInfo | null;
    private apiUserInfo: ApiUserInfo | null;
    private error: UIError | null;
    private setOAuthUserInfo: Dispatch<SetStateAction<OAuthUserInfo | null>> | null;
    private setApiUserInfo: Dispatch<SetStateAction<ApiUserInfo | null>> | null;
    private setError: Dispatch<SetStateAction<UIError | null>> | null;

    public constructor(
        fetchClient: FetchClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this.fetchClient = fetchClient;
        this.eventBus = eventBus;
        this.viewModelCoordinator = viewModelCoordinator;
        this.oauthUserInfo = null;
        this.apiUserInfo = null;
        this.error = null;
        this.setOAuthUserInfo = null;
        this.setApiUserInfo = null;
        this.setError = null;
    }

    /*
     * Initialize bindable model state when the view loads
     */
    public use(): UserInfoViewModel {

        const [, setOAuthUserInfo] = useState(this.oauthUserInfo);
        this.setOAuthUserInfo = setOAuthUserInfo;

        const [, setApiUserInfo] = useState(this.apiUserInfo);
        this.setApiUserInfo = setApiUserInfo;

        const [, setError] = useState(this.error);
        this.setError = setError;

        return this;
    }

    /*
     * Property accessors
     */
    public getOAuthUserInfo(): OAuthUserInfo | null {
        return this.oauthUserInfo;
    }

    public getApiUserInfo(): ApiUserInfo | null {
        return this.apiUserInfo;
    }

    public getError(): UIError | null {
        return this.error;
    }

    public getEventBus(): EventBus {
        return this.eventBus;
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

        this.viewModelCoordinator.onUserInfoViewModelLoading();
        this.updateError(null);

        try {

            // Set up promises for the two sources of user info
            const oauthUserInfoPromise = this.fetchClient.getOAuthUserInfo(oauthFetchOptions);
            const apiUserInfoPromise = this.fetchClient.getApiUserInfo(apiFetchOptions);

            // Run the tasks in parallel
            const results = await Promise.all([oauthUserInfoPromise, apiUserInfoPromise]);
            const oauthUserInfo = results[0];
            const apiUserInfo = results[1];

            // Update data
            if (oauthUserInfo) {
                this.updateOAuthUserInfo(oauthUserInfo);
            }
            if (apiUserInfo) {
                this.updateApiUserInfo(apiUserInfo);
            }

        } catch (e: any) {

            this.updateError(ErrorFactory.fromException(e));
            this.updateOAuthUserInfo(null);
            this.updateApiUserInfo(null);

        } finally {

            this.viewModelCoordinator.onUserInfoViewModelLoaded();
        }
    }

    /*
     * Unload when the user navigates to login required
     */
    public unload(): void {
        this.updateOAuthUserInfo(null);
        this.updateApiUserInfo(null);
        this.updateError(null);
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
    private updateOAuthUserInfo(oauthUserInfo: OAuthUserInfo | null): void {

        this.oauthUserInfo = oauthUserInfo;
        if (this.setOAuthUserInfo) {
            this.setOAuthUserInfo(oauthUserInfo);
        }
    }

    /*
     * Update state and the binding system
     */
    private updateApiUserInfo(apiUserInfo: ApiUserInfo | null): void {

        this.apiUserInfo = apiUserInfo;
        if (this.setApiUserInfo) {
            this.setApiUserInfo(apiUserInfo);
        }
    }

    /*
     * Update state and the binding system
     */
    private updateError(error: UIError | null): void {

        this.error = error;
        if (this.setError) {
            this.setError(error);
        }
    }
}
