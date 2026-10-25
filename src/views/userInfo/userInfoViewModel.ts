import EventBus from 'js-event-bus';
import {FetchCacheKeys} from '../../api/cache/fetchCacheKeys';
import {ApiClient} from '../../api/client/apiClient';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {UserInfoViewState} from './userInfoViewState';

/*
 * The user info view model manages API state
 */
export class UserInfoViewModel {

    private readonly apiClient: ApiClient;
    private readonly eventBus: EventBus;
    private listener: (() => void) | null;
    private snapshot: UserInfoViewState;

    public constructor(apiClient: ApiClient, eventBus: EventBus) {

        this.apiClient = apiClient;
        this.eventBus = eventBus;
        this.listener = null;
        this.snapshot = {oauthUserInfo: null, apiUserInfo: null, error: null};
    }

    /*
     * Subscribe a listener for useSyncExternalStore and return an unsubscribe function
     */
    public subscribe(listener: () => void): () => void {

        this.listener = listener;
        return () => {
            this.listener = null;
        };
    }

    /*
     * Return the current state
     */
    public getSnapshot(): UserInfoViewState {
        return this.snapshot;
    }

    /*
     * Enable the view to use the EventBus
     */
    public getEventBus(): EventBus {
        return this.eventBus;
    }

    /*
     * Get data from the API and notify the view
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

        this.snapshot = {oauthUserInfo: null, apiUserInfo: null, error: null};

        try {

            // Set up promises for the two sources of user info
            const oauthUserInfoPromise = this.apiClient.getOAuthUserInfo(oauthFetchOptions);
            const apiUserInfoPromise = this.apiClient.getApiUserInfo(apiFetchOptions);

            // Run the tasks in parallel
            const results = await Promise.all([oauthUserInfoPromise, apiUserInfoPromise]);
            const oauthUserInfo = results[0];
            const apiUserInfo = results[1];

            if (oauthUserInfo && apiUserInfo) {
                this.snapshot = {oauthUserInfo, apiUserInfo, error: null};
            }

        } catch (e: any) {

            this.snapshot = {oauthUserInfo: null, apiUserInfo: null, error: ErrorFactory.fromException(e)};

        } finally {

            this.notifyView();
        }
    }

    /*
     * Unload when the user navigates to login required
     */
    public unload(): void {
        this.snapshot = {oauthUserInfo: null, apiUserInfo: null, error: null};
        this.notifyView();
    }

    /*
     * Update the view when the model data changes
     */
    private notifyView(): void {
        if (this.listener) {
            this.listener();
        }
    }
}
