import EventBus from 'js-event-bus';
import {FetchCache} from '../client/fetchCache';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/uiError';
import {EventNames} from '../../plumbing/events/eventNames';
import {ApiRequestEvent} from '../../plumbing/events/apiRequestEvent';
import {LoginRequiredEvent} from '../../plumbing/events/loginRequiredEvent';

/*
 * Coordinates API requests from multiple views, and handles session expiry when required
 */
export class ApiRequestCoordinator {

    private readonly eventBus: EventBus;
    private readonly fetchCache: FetchCache;
    private cacheKeys: string[];
    private loadingCount: number;
    private loadedCount: number;

    /*
     * Set the initial state
     */
    public constructor(eventBus: EventBus, fetchCache: FetchCache) {

        this.eventBus = eventBus;
        this.fetchCache = fetchCache;
        this.cacheKeys = [];
        this.loadingCount = 0;
        this.loadedCount = 0;
        this.setupCallbacks();
    }

    /*
     * Called by a view model when it starts an API request
     * Accepts one or more cache keys to support view models that make concurrent requests
     * Fires ApiRequestEvent(false) on the first request of a batch to signal loading has begun
     */
    public onApiRequestStart(...cacheKeys: string[]): void {

        if (this.loadingCount === 0) {
            this.cacheKeys = [];
        }

        this.cacheKeys.push(...cacheKeys);
        ++this.loadingCount;

        if (this.loadingCount === 1) {
            this.eventBus.emit(EventNames.ApiRequest, null, new ApiRequestEvent(false));
        }
    }

    /*
     * Called by a view model when its API request completes
     * Fires ApiRequestEvent(true) once all pending requests in the batch have finished
     */
    public onApiRequestEnd(): void {

        ++this.loadedCount;
        this.handleAllRequestsComplete();
    }

    /*
     * Return true if there were any load errors
     */
    public hasErrors(): boolean {
        return this.getLoadErrors().length > 0;
    }

    /*
     * Reset state when the Reload Data button is clicked or on logout
     */
    public resetState(): void {
        this.cacheKeys = [];
        this.loadingCount = 0;
        this.loadedCount = 0;
        this.fetchCache.clearAll();
    }

    /*
     * Handle OAuth related errors once all requests in the batch finish
     */
    private handleAllRequestsComplete(): void {

        if (this.loadedCount === this.loadingCount) {

            // Reset counts, which include extra calls triggered by React strict mode
            this.loadingCount = 0;
            this.loadedCount = 0;

            // Notify subscribers when all API requests have completed successfully
            const errors = this.getLoadErrors();
            if (errors.length === 0) {
                this.eventBus.emit(EventNames.ApiRequest, null, new ApiRequestEvent(true));
            }
            
            // Login required errors occur when there are no tokens yet or when token refresh fails
            // Raise a single event so that navigation to login required is triggered only once
            const loginRequired = errors.find((e) => e.getErrorCode() === ErrorCodes.loginRequired);
            if (loginRequired) {
                this.resetState();
                this.eventBus.emit(EventNames.LoginRequired, new LoginRequiredEvent());
            }
        }
    }

    /*
     * Collect errors from all cache keys registered in the current batch
     */
    private getLoadErrors(): UIError[] {

        const errors: UIError[] = [];

        this.cacheKeys.forEach((k) => {

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
        this.onApiRequestStart = this.onApiRequestStart.bind(this);
        this.onApiRequestEnd = this.onApiRequestEnd.bind(this);
    }
}
