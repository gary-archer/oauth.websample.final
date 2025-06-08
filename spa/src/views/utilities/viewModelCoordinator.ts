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

    private readonly eventBus: EventBus;
    private readonly fetchCache: FetchCache;
    private mainCacheKey: string;
    private loadingCount: number;
    private loadedCount: number;

    /*
     * Set the initial state
     */
    public constructor(eventBus: EventBus, fetchCache: FetchCache) {

        this.eventBus = eventBus;
        this.fetchCache = fetchCache;
        this.mainCacheKey = '';
        this.loadingCount = 0;
        this.loadedCount = 0;
        this.setupCallbacks();
    }

    /*
     * This is called when the companies or transactions view model start sending API requests
     */
    public onMainViewModelLoading(): void {

        // Update stats
        ++this.loadingCount;

        // Send an event so that a subscriber can show a UI effect, such as disabling header buttons
        this.eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(false));
    }

    /*
     * This is called when the companies or transactions view model finish sending API requests
     */
    public onMainViewModelLoaded(cacheKey: string): void {

        // Increase stats
        this.mainCacheKey = cacheKey;
        ++this.loadedCount;

        // On success, send an event so that a subscriber can show a UI effect such as enabling header buttons
        const found = this.fetchCache.getItem(cacheKey);
        if (found?.getData()) {
            this.eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(true));
        }

        // Perform error logic after all views have loaded
        this.handleAllViewsLoaded();
    }

    /*
     * This is called when the userinfo view model starts sending API requests
     */
    public onUserInfoViewModelLoading(): void {
        ++this.loadingCount;
    }

    /*
     * This is called when the userinfo view model finishes sending API requests
     */
    public onUserInfoViewModelLoaded(): void {
        ++this.loadedCount;
        this.handleAllViewsLoaded();
    }

    /*
     * Return true if there were any load errors
     */
    public hasErrors(): boolean {
        return this.getLoadErrors().length > 0;
    }

    /*
     * Reset state when the Reload Data button is clicked
     */
    public resetState(): void {
        this.mainCacheKey = '';
        this.fetchCache.clearAll();
    }

    /*
     * Handle OAuth related errors once all views finish loading
     */
    private handleAllViewsLoaded(): void {

        if (this.loadedCount === this.loadingCount) {

            // Reset counts, which include extra calls triggered by React strict mode
            this.loadingCount = 0;
            this.loadedCount = 0;

            // Login required errors occur when there are no tokens yet or when token refresh fails
            // The sample's user behavior is to automatically redirect the user to login
            const errors = this.getLoadErrors();
            const loginRequired = errors.find((e) => e.getErrorCode() === ErrorCodes.loginRequired);
            if (loginRequired) {
                this.resetState();
                this.eventBus.emit(EventNames.LoginRequired, new LoginRequiredEvent());
                return;
            }
        }
    }

    /*
     * Get the result of loading all views
     */
    private getLoadErrors(): UIError[] {

        const errors: UIError[] = [];

        const keys = [];
        if (this.mainCacheKey) {
            keys.push(this.mainCacheKey);
        }
        keys.push(FetchCacheKeys.OAuthUserInfo);
        keys.push(FetchCacheKeys.ApiUserInfo);

        keys.forEach((k) => {

            const found = this.fetchCache.getItem(k);
            const error = found?.getError();
            if (error) {
                errors.push(error);
            }
        });

        return errors;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private setupCallbacks(): void {
        this.onMainViewModelLoading = this.onMainViewModelLoading.bind(this);
        this.onMainViewModelLoaded = this.onMainViewModelLoaded.bind(this);
        this.onUserInfoViewModelLoading = this.onUserInfoViewModelLoading.bind(this);
        this.onUserInfoViewModelLoaded = this.onUserInfoViewModelLoaded.bind(this);
    }
}
