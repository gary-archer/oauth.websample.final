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

        if (name === ViewNames.Main) {
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(false));
        }
    }

    /*
     * Handle loaded notifications by sending an event
     * A subscriber can then show a UI effect such as enabling header buttons
     */
    public onViewLoaded(name: string): void {

        if (name === ViewNames.Main) {
            this._eventBus.emit(EventNames.ViewModelFetch, null, new ViewModelFetchEvent(true));
        }

        this._triggerLoginIfRequired();
    }

    /*
     * Return true if there are any load errors
     */
    public hasErrors(): boolean {
        return false;
    }

    /*
     * If all views are loaded and one or more has reported login required, then trigger a redirect
     */
    private _triggerLoginIfRequired(): void {

        // this._eventBus.emit(EventNames.LoginRequired, null, new LoginRequiredEvent());
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.onViewLoading = this.onViewLoading.bind(this);
        this.onViewLoaded = this.onViewLoaded.bind(this);
    }
}
