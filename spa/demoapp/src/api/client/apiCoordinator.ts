import EventBus from 'js-event-bus';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {ViewModelFetchEvent} from '../../plumbing/events/viewModelFetchEvent';
import {LoginRequiredEvent} from '../../plumbing/events/loginRequiredEvent';
import {HttpRequestCache} from '../../plumbing/http/httpRequestCache';
import {HttpRequestNames} from '../../plumbing/http/httpRequestNames';

/*
 * Coordinates API requests from multiple views, so that login redirects are only triggered once
 */
export class ApiCoordinator {

    private readonly _httpRequestCache: HttpRequestCache;
    private readonly _eventBus: EventBus;
    private _currentMainRequest = '';

    /*
     * Set the initial state
     */
    public constructor(httpRequestCache: HttpRequestCache, eventBus: EventBus) {

        this._httpRequestCache = httpRequestCache;
        this._eventBus = eventBus;
        this._setupCallbacks();
    }

    /*
     * Handle loading notifications by sending an event
     * A subscriber can then show a UI effect such as disabling header buttons
     */
    public onViewLoading(name: string): void {

        if (name === HttpRequestNames.Companies || name === HttpRequestNames.Transactions) {
            this._currentMainRequest = name;
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(false));
        }
    }

    /*
     * Handle loaded notifications by sending an event
     * A subscriber can then show a UI effect such as enabling header buttons
     */
    public onViewLoaded(name: string): void {

        if (name === HttpRequestNames.Companies || name === HttpRequestNames.Transactions) {
            this._currentMainRequest = name;
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(true));
        }

        this._triggerLoginIfRequired();
    }

    /*
     * Return true if there are any load errors
     */
    public hasErrors(): boolean {

        const mainCacheItem = this._httpRequestCache.getItem(this._currentMainRequest);
        const userInfoCacheItem = this._httpRequestCache.getItem(HttpRequestNames.UserInfo);
        return !!mainCacheItem?.error|| !!userInfoCacheItem?.error;
    }

    /*
     * If all views are loaded and one or more has reported login required, then trigger a redirect
     */
    private _triggerLoginIfRequired(): void {

        // Get results of API requests
        const mainCacheItem = this._httpRequestCache.getItem(this._currentMainRequest);
        const userInfoCacheItem = this._httpRequestCache.getItem(HttpRequestNames.UserInfo);

        // See if either API call has a login required result
        if (mainCacheItem?.error?.errorCode === ErrorCodes.loginRequired ||
            userInfoCacheItem?.error?.errorCode === ErrorCodes.loginRequired) {

            // If so then raise a single event to start a login
            this._eventBus.emit(EventNames.LoginRequired, null, new LoginRequiredEvent());
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.onViewLoading = this.onViewLoading.bind(this);
        this.onViewLoaded = this.onViewLoaded.bind(this);
    }
}
