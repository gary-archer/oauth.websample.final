import EventBus from 'js-event-bus';
import {ErrorCodes} from '../../errors/errorCodes';
import {UIError} from '../../errors/uiError';
import {EventNames} from '../../events/eventNames';
import {ApiRequestsEvent} from '../../events/apiRequestsEvent';
import {LoginRequiredEvent} from '../../events/loginRequiredEvent';

/*
 * Coordinates API requests from multiple views, and handles session expiry when required
 */
export class ApiRequestCoordinator {

    private readonly eventBus: EventBus;
    private loadingCount: number;
    private loadedCount: number;
    private urls: string[];
    private errors: UIError[];

    /*
     * Set the initial state
     */
    public constructor(eventBus: EventBus) {

        this.eventBus = eventBus;
        this.loadingCount = 0;
        this.loadedCount = 0;
        this.urls = [];
        this.errors = [];
        this.setupCallbacks();
    }

    /*
     * Called when an API request starts
     * Fires ApiRequestsEvent(false) on the first request of a batch to signal loading has begun
     */
    public onApiRequestStart(url: string): void {

        if (this.loadingCount === 0) {
            this.errors = [];
            this.eventBus.emit(EventNames.ApiRequests, null, new ApiRequestsEvent(false));
        }

        ++this.loadingCount;
        this.urls.push(url);
    }

    /*
     * Called when an API request ends
     * Fires ApiRequestsEvent(true) once all pending requests in the batch have finished
     */
    public onApiRequestEnd(error: UIError | null = null): void {

        ++this.loadedCount;
        if (error) {
            this.errors.push(error);
        }
        this.handleAllRequestsComplete();
    }

    /*
     * In React strict mode, detect additional API requests due to view recreation
     */
    public isApiRequestInFlight(url: string): boolean {
        return this.urls.includes(url);
    }

    /*
     * Return true if there were any errors on the last batch of API requests
     */
    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    /*
     * Reset all state when the user logs out
     */
    public resetState(): void {

        this.urls = [];
        this.errors = [];
        this.loadingCount = 0;
        this.loadedCount = 0;
    }

    /*
     * Handle OAuth related errors once all requests in the batch finish
     */
    private handleAllRequestsComplete(): void {

        if (this.loadedCount === this.loadingCount) {

            // Reset data
            this.loadingCount = 0;
            this.loadedCount = 0;
            this.urls = [];

            // Notify subscribers when all API requests have completed successfully
            if (this.errors.length === 0) {
                this.eventBus.emit(EventNames.ApiRequests, null, new ApiRequestsEvent(true));
            }

            // Login required errors occur when there are no tokens yet or when token refresh fails
            // Raise a single event so that navigation to login required is triggered only once
            const loginRequired = this.errors.find((e) => e.getErrorCode() === ErrorCodes.loginRequired);
            if (loginRequired) {
                this.eventBus.emit(EventNames.LoginRequired, new LoginRequiredEvent());
            }
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private setupCallbacks(): void {
        this.onApiRequestStart = this.onApiRequestStart.bind(this);
        this.onApiRequestEnd = this.onApiRequestEnd.bind(this);
    }
}
