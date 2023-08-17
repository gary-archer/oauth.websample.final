import EventBus from 'js-event-bus';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/lib';
import {EventNames} from '../../plumbing/events/eventNames';
import {ViewModelFetchEvent} from '../../plumbing/events/viewModelFetchEvent';
import {LoginRequiredEvent} from '../../plumbing/events/loginRequiredEvent';
import {HttpRequestCache} from '../../plumbing/http/httpRequestCache';

/*
 * Coordinates API requests from multiple views, and notifies once all API calls are complete
 * This ensures that login redirects are only triggered once
 */
export class ViewModelCoordinator {

    private readonly _httpRequestCache: HttpRequestCache;
    private readonly _eventBus: EventBus;
    private _mainApiUrl: string;
    private readonly _extraApiUrls: string[];

    /*
     * Set the initial state
     */
    public constructor(httpRequestCache: HttpRequestCache, eventBus: EventBus, extraApiUrls: string[]) {

        this._setupCallbacks();

        this._httpRequestCache = httpRequestCache;
        this._eventBus = eventBus;
        this._mainApiUrl = '';
        this._extraApiUrls = extraApiUrls;
    }

    /*
     * This is called when the companies or transactions view model start sending API requests
     * Send an event so that a subscriber can show a UI effect, such as disabling header buttons
     */
    public onMainViewModelLoading(): void {
        this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(false));
    }

    /*
     * This is called when the companies or transactions view model finish sending API requests
     */
    public onMainViewModelLoaded(mainApiUrl: string): void {

        // Send an event so that a subscriber can show a UI effect such as enabling header buttons
        this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(true));

        // Record the URL so that we can look up its result
        this._mainApiUrl = mainApiUrl;

        // If all views have loaded, see if we need to trigger a login redirect
        this._triggerLoginIfRequired();
    }

    /*
     * This is called when fixed views finish sending API requests
     * If all views have loaded, see if we need to trigger a login redirect
     */
    public onViewModelLoaded(): void {
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
        this._mainApiUrl = '';
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
     * See if all API requests have completed
     */
    private _allViewsLoaded(): boolean {

        if (!this._mainApiUrl) {
            return false;
        }

        let count = 0;
        this._extraApiUrls.forEach((u) => {

            const found = this._httpRequestCache.getItem(u);
            if (found && !found?.isLoading) {
                count++;
            }
        });

        return count === this._extraApiUrls.length;
    }

    /*
     * Get the result of loading all views
     */
    private _getLoadErrors(): UIError[] {

        const errors: UIError[] = [];
        if (this._mainApiUrl) {

            const foundMain = this._httpRequestCache.getItem(this._mainApiUrl);
            if (foundMain?.error) {
                errors.push(foundMain.error);
            }
        }

        this._extraApiUrls.forEach((u) => {

            const found = this._httpRequestCache.getItem(u);
            if (found?.error) {
                errors.push(found.error)
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
        this.onViewModelLoaded = this.onViewModelLoaded.bind(this);
    }
}
