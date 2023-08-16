import EventBus from 'js-event-bus';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {EventNames} from '../../plumbing/events/eventNames';
import {ViewModelFetchEvent} from '../../plumbing/events/viewModelFetchEvent';
import {LoginRequiredEvent} from '../../plumbing/events/loginRequiredEvent';
import {HttpRequestCache} from '../../plumbing/http/httpRequestCache';
import {ViewNames} from '../../views/utilities/viewNames';

/*
 * Coordinates API requests from multiple views, and notifies once all API calls are complete
 * This ensures that login redirects are only triggered once
 */
export class ViewModelCoordinator {

    private readonly _httpRequestCache: HttpRequestCache;
    private readonly _eventBus: EventBus;
    private _urls: string[];

    /*
     * Set the initial state
     */
    public constructor(httpRequestCache: HttpRequestCache, eventBus: EventBus) {

        this._httpRequestCache = httpRequestCache;
        this._eventBus = eventBus;
        this._urls = [];
        this._setupCallbacks();
    }

    /*
     * Handle loading notifications by sending an event
     */
    public onViewLoading(name: string): void {

        // A subscriber can then show a UI effect such as disabling header buttons
        if (name === ViewNames.Main) {
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(false));
        }
    }

    /*
     * Handle loaded notifications by sending an event
     */
    public onViewLoaded(name: string, urls: string[]): void {

        // A subscriber can then show a UI effect such as enabling header buttons
        if (name === ViewNames.Main) {
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(true));
        }

        // Store the URLs of API requests sent from the view model
        urls.forEach((u) => this._urls.push(u));

        // If all views have loaded then see if we need to trigger a login redirect
        this._triggerLoginIfRequired();
    }

    /*
     * Return true if there were any load errors
     */
    public hasErrors(): boolean {

        let result = false;
        this._urls.forEach((u) => {

            const found = this._httpRequestCache.getItem(u);
            if (found?.error) {
                result = true;
            }
        });

        return result;
    }

    /*
     * Reset state when the Reload Data button is clicked
     */
    public resetState(): void {
        this._urls = [];
    }

    /*
     * If all views are loaded and one or more has reported login required, then trigger a redirect
     */
    private _triggerLoginIfRequired(): void {

        // The SPA makes two API requests, for the main view and for user info
        if (this._urls.length === 2) {
            if (this._calculateIsLoginRequired()) {
                this._eventBus.emit(EventNames.LoginRequired, new LoginRequiredEvent());
            }
        }
    }

    /*
     * Record if any API requests returned a login required result
     */
    private _calculateIsLoginRequired(): boolean {

        let result = false;
        this._urls.forEach((u) => {

            const found = this._httpRequestCache.getItem(u);
            if (found?.error?.errorCode === ErrorCodes.loginRequired) {
                result = true;
            }
        });

        return result;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.onViewLoading = this.onViewLoading.bind(this);
        this.onViewLoaded = this.onViewLoaded.bind(this);
    }
}
