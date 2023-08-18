import EventBus from 'js-event-bus';
import {FetchCache} from '../../api/client/fetchCache';
import {FetchCacheKeys} from '../../api/client/fetchCacheKeys';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {ViewModelFetchEvent} from '../../plumbing/events/viewModelFetchEvent';
import {LoginRequiredEvent} from '../../plumbing/events/loginRequiredEvent';

/*
 * Coordinates API requests from multiple views, and notifies once all API calls are complete
 * This ensures that login redirects are only triggered once
 */
export class ViewModelCoordinator {

    private readonly _eventBus: EventBus;
    private readonly _fetchCache: FetchCache;
    private _mainLoading: boolean;
    private _userInfoLoading: boolean;
    private _mainCacheKey: string;

    /*
     * Set the initial state
     */
    public constructor(eventBus: EventBus, fetchCache: FetchCache) {

        this._eventBus = eventBus;
        this._fetchCache = fetchCache;
        this._mainLoading = false;
        this._userInfoLoading = false;
        this._mainCacheKey = '';
        this._setupCallbacks();
    }

    /*
     * This is called when the companies or transactions view model start sending API requests
     */
    public onMainViewModelLoading(): void {

        // Send an event so that a subscriber can show a UI effect, such as disabling header buttons
        if (!this._mainLoading) {
            this._mainLoading = true;
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(false));
        }
    }

    /*
     * This is called when the companies or transactions view model finish sending API requests
     */
    public onMainViewModelLoaded(cacheKey: string): void {

        // Record the cache key so that we can look up its result later
        this._mainLoading = false;
        this._mainCacheKey = cacheKey;

        // On success, send an event so that a subscriber can show a UI effect such as enabling header buttons
        const found = this._fetchCache.getItem(cacheKey);
        if (!found?.error) {
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(true));
        }

        // If all views have loaded, see if we need to trigger a login redirect
        this._triggerLoginIfRequired();
    }

    /*
     * I need to do something here, though loading fires for the real request and also strict mode
     */
    public onUserInfoViewModelLoading(): void {
        this._userInfoLoading = true;
    }

    /*
     * This is called when fixed views finish sending API requests
     * If all views have loaded, see if we need to trigger a login redirect
     */
    public onUserInfoViewModelLoaded(): void {

        this._userInfoLoading = false;
        this._triggerLoginIfRequired();
    }

    /*
     * Return true if there were any load errors
     */
    public hasErrors(): boolean {
        return this._getLoadErrors().length > 0;
    }

    /*
     * Reset state when the Reload Data button is clicked
     */
    public resetState(): void {
        this._mainLoading = false;
        this._userInfoLoading = false;
        this._mainCacheKey = '';
    }

    /*
     * If all views are loaded and one or more has reported login required, then trigger a redirect
     */
    private _triggerLoginIfRequired(): void {

        if (this._allViewsLoaded()) {

            const errors = this._getLoadErrors();
            const found = errors.find((e) => e.errorCode === ErrorCodes.loginRequired);
            if (found) {
                this._eventBus.emit(EventNames.LoginRequired, new LoginRequiredEvent());
            }
        }
    }

    /*
     * See if all API requests have completed, and there are only 3 in the demo app
     */
    private _allViewsLoaded(): boolean {
        return !this._mainLoading && !this._userInfoLoading;
    }

    /*
     * Get the result of loading all views
     */
    private _getLoadErrors(): UIError[] {

        const errors: UIError[] = [];

        const keys = [];
        if (this._mainCacheKey) {
            keys.push(this._mainCacheKey);
        }
        keys.push(FetchCacheKeys.OAuthUserInfo);
        keys.push(FetchCacheKeys.ApiUserInfo);

        keys.forEach((k) => {

            const found = this._fetchCache.getItem(k);
            if (found?.error) {
                errors.push(found.error);
            }
        });

        return errors;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.onMainViewModelLoading = this.onMainViewModelLoading.bind(this);
        this.onMainViewModelLoaded = this.onMainViewModelLoaded.bind(this);
        this.onUserInfoViewModelLoading = this.onUserInfoViewModelLoading.bind(this);
        this.onUserInfoViewModelLoaded = this.onUserInfoViewModelLoaded.bind(this);
    }
}
