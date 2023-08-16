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
    private _hasErrors: boolean;

    /*
     * Set the initial state
     */
    public constructor(httpRequestCache: HttpRequestCache, eventBus: EventBus) {

        this._httpRequestCache = httpRequestCache;
        this._eventBus = eventBus;
        this._urls = [];
        this._hasErrors = false;
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
     * If all views are loaded and one or more has reported login required, then trigger a redirect
     */
    private _triggerLoginIfRequired(): void {

        // The SPA makes two API requests, for the main view and for user info
        // Once all views have loaded, classify results and reset
        if (this._urls.length === 2) {

            // Record whether there are any errors
            this._hasErrors = this._calculateHasErrors();

            // Fire the event if needed
            if (this._calculateIsLoginRequired()) {
                this._eventBus.emit(EventNames.LoginRequired, new LoginRequiredEvent());
            }

            // Reset
            this._urls = [];
        }
    }

    /*
     * Record if there were any API errors that might require a reload later
     */
    private _calculateHasErrors(): boolean {

        this._urls.forEach((u) => {

            const found = this._httpRequestCache.getItem(u);
            if (found?.error) {
                return true;
            }
        });

        return false;
    }

    /*
     * Record if any API requests returned a login required result
     */
    private _calculateIsLoginRequired(): boolean {

        this._urls.forEach((u) => {

            const found = this._httpRequestCache.getItem(u);
            if (found?.error?.errorCode === ErrorCodes.loginRequired) {
                return true;
            }
        });

        return false;
    }

    /*
     * Return true if there were any load errors
     */
    public hasErrors(): boolean {
        return this._hasErrors;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.onViewLoading = this.onViewLoading.bind(this);
        this.onViewLoaded = this.onViewLoaded.bind(this);
    }
}
