import EventBus from 'js-event-bus';
import {FetchCache} from '../../api/client/fetchCache';
import {FetchCacheKeys} from '../../api/client/fetchCacheKeys';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {ViewModelFetchEvent} from '../../plumbing/events/viewModelFetchEvent';
import {LoginRequiredEvent} from '../../plumbing/events/loginRequiredEvent';
import {Authenticator} from '../../plumbing/oauth/authenticator';

/*
 * Coordinates API requests from multiple views, and notifies once all API calls are complete
 * This ensures that login redirects are only triggered once
 */
export class ViewModelCoordinator {

    private readonly _eventBus: EventBus;
    private readonly _fetchCache: FetchCache;
    private readonly _authenticator: Authenticator;
    private _mainCacheKey: string;
    private _loadingCount: number;
    private _loadedCount: number;

    /*
     * Set the initial state
     */
    public constructor(eventBus: EventBus, fetchCache: FetchCache, authenticator: Authenticator) {

        this._eventBus = eventBus;
        this._fetchCache = fetchCache;
        this._authenticator = authenticator;
        this._mainCacheKey = '';
        this._loadingCount = 0;
        this._loadedCount = 0;
        this._setupCallbacks();
    }

    /*
     * This is called when the companies or transactions view model start sending API requests
     */
    public onMainViewModelLoading(): void {

        // Update stats
        ++this._loadingCount;

        // Send an event so that a subscriber can show a UI effect, such as disabling header buttons
        this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(false));
    }

    /*
     * This is called when the companies or transactions view model finish sending API requests
     */
    public onMainViewModelLoaded(cacheKey: string): void {

        // Increase stats
        this._mainCacheKey = cacheKey;
        ++this._loadedCount;

        // On success, send an event so that a subscriber can show a UI effect such as enabling header buttons
        const found = this._fetchCache.getItem(cacheKey);
        if (found?.data) {
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(true));
        }

        // Perform error logic after all views have loaded
        this._handleErrorsAfterLoad();
    }

    /*
     * This is called when the userinfo view model starts sending API requests
     */
    public onUserInfoViewModelLoading(): void {
        ++this._loadingCount;
    }

    /*
     * This is called when the userinfo view model finishes sending API requests
     */
    public onUserInfoViewModelLoaded(): void {
        ++this._loadedCount;
        this._handleErrorsAfterLoad();
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
        this._loadingCount = 0;
        this._loadedCount = 0;
        this._mainCacheKey = '';
        this._fetchCache.clearAll();
    }

    /*
     * Handle OAuth related errors
     */
    private _handleErrorsAfterLoad(): void {

        if (this._loadedCount === this._loadingCount) {

            const errors = this._getLoadErrors();

            // Login required errors occur when there are no tokens yet or when token refresh fails
            // The sample's user behavior is to automatically redirect the user to login
            const loginRequired = errors.find((e) => e.errorCode === ErrorCodes.loginRequired);
            if (loginRequired) {
                this.resetState();
                this._eventBus.emit(EventNames.LoginRequired, new LoginRequiredEvent());
                return;
            }

            // In normal conditions the following errors are likely to be OAuth configuration errors
            const oauthConfigurationError = errors.find((e) =>
                (e.statusCode === 401 && e.errorCode === ErrorCodes.invalidToken) ||
                (e.statusCode === 403 && e.errorCode === ErrorCodes.insufficientScope));

            // The sample's user behavior is to present an error, after which clicking Home runs a new login redirect
            // This allows the frontend application to get new tokens, which may fix the problem in some cases
            if (oauthConfigurationError) {
                this._authenticator.clearLoginState();
                return;
            }
        }
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
