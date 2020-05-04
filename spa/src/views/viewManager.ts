import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {UIError} from '../plumbing/errors/uiError';

/*
 * A helper class to coordinate multiple views loading data from the API
 */
export class ViewManager {

    // Load state
    private _viewsToLoad: number;
    private _loadedCount: number;
    private _hasErrors: boolean;
    private _loginRequired: boolean;

    // Application callbacks
    private readonly _onLoginRequired: () => void;
    private readonly _onLoadStateChanged: (enabled: boolean) => void;

    /*
     * Create the view manager at application startup
     */
    public constructor(loginRequired: () => void, onLoadStateChanged: (enabled: boolean) => void) {

        // Store callbacks
        this._onLoginRequired = loginRequired;
        this._onLoadStateChanged = onLoadStateChanged;

        // Default to loading a single view, unless the parent informs us otherwise
        this._viewsToLoad = 1;
        this._loadedCount = 0;
        this._hasErrors = false;
        this._loginRequired = false;
        this._setupCallbacks();
    }

    /*
     * Allow the parent to set the number of views to load
     */
    public setViewCount(count: number) {
        this._reset();
        this._viewsToLoad = count;
    }

    /*
     * Handle the view loading event and inform the parent, which can render a loading state
     */
    public onViewLoading() {
        this._onLoadStateChanged(false);
    }

    /*
     * Handle the view loaded event and call back the parent when all loading is complete
     */
    public onViewLoaded() {

        this._loadedCount++;

        // Once all views have loaded, inform the parent if all views loaded successfully
        if (this._loadedCount === this._viewsToLoad) {

            if (!this.hasErrors) {
                this._onLoadStateChanged(true);
            }

            this._reset();
        }
    }

    /*
     * Handle the view load failed event
     */
    public onViewLoadFailed(error: UIError) {

        this._loadedCount +=  1;
        this._hasErrors = true;

        // Record if this was a login required error
        if (error.errorCode === ErrorCodes.loginRequired) {
            this._loginRequired = true;
        }

        // Once all views have loaded, reset state and, if required, trigger a login redirect only once
        if (this._loadedCount === this._viewsToLoad) {

            const triggerLoginOnParent = this._loginRequired;
            this._reset();

            if (triggerLoginOnParent) {
                this._onLoginRequired();
            }
        }
    }

    /*
     * Return true if any views failed to load
     */
    public get hasErrors(): boolean {
        return this._hasErrors;
    }

    /*
     * Reset to the initial state once loading is complete
     * Default to loading a single view, unless the parent informs us otherwise
     */
    private _reset() {
        this._viewsToLoad = 1;
        this._loadedCount = 0;
        this._hasErrors = false;
        this._loginRequired = false;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.onViewLoading = this.onViewLoading.bind(this);
        this.onViewLoaded = this.onViewLoaded.bind(this);
        this.onViewLoadFailed = this.onViewLoadFailed.bind(this);
    }
}
