import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {UserInfo} from '../../api/entities/userInfo';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {UIError} from '../../plumbing/errors/uiError';
import {ApiViewEvents} from '../utilities/apiViewEvents';
import {ApiViewNames} from '../utilities/apiViewNames';
import {UserInfoLoadOptions}  from './userInfoLoadOptions';

/*
 * The view model for the user info view
 */
export class UserInfoViewModel {

    private readonly _apiClient: ApiClient;
    private readonly _eventBus: EventBus;
    private readonly _apiViewEvents: ApiViewEvents;
    private _isLoaded: boolean;

    public constructor(
        apiClient: ApiClient,
        eventBus: EventBus,
        apiViewEvents: ApiViewEvents,
    ) {
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._apiViewEvents = apiViewEvents;
        this._isLoaded = false;
    }

    /*
     * Property accessors
     */
    public get eventBus(): EventBus {
        return this._eventBus;
    }

    /*
     * Get data from the API and then notify the caller
     */
    public async callApi(
        onSuccess: (userInfo: UserInfo) => void,
        onError: (error: UIError) => void,
        options: UserInfoLoadOptions): Promise<void> {

        // Return early if no load is needed
        if (!options.isInMainView || (this._isLoaded && !options.reload)) {
            this._apiViewEvents.onViewLoaded(ApiViewNames.UserInfo);
            return;
        }

        try {

            this._apiViewEvents.onViewLoading(ApiViewNames.UserInfo);
            const requestOptions = {causeError: options.causeError};

            const userInfo = await this._apiClient.getUserInfo(requestOptions);

            this._apiViewEvents.onViewLoaded(ApiViewNames.UserInfo);
            this._isLoaded = true;
            onSuccess(userInfo);

        } catch (e) {

            this._isLoaded = false;
            const error = ErrorHandler.getFromException(e);
            this._apiViewEvents.onViewLoadFailed(ApiViewNames.UserInfo, error);
            onError(error);
        }
    }

    /*
     * Reset state when logging out
     */
    public unload(): void {
        this._isLoaded = false;
    }
}
