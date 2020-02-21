import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {UIError} from '../plumbing/errors/uiError';
import {LogoutView} from './logout/logoutView';

/*
 * A helper class to coordinate multiple views
 */
export class ViewManager {

    // Load state
    private _mainViewLoaded: boolean;
    private _userInfoLoaded: boolean;

    // Errors from child views
    private _mainViewLoadError: UIError | null;
    private _userInfoLoadError: UIError | null;

    // Application callbacks
    private readonly _onLoginRequired: () => void;
    private readonly _onLoadStateChanged: (enabled: boolean) => void;

    public constructor(loginRequired: () => void, onLoadStateChanged: (enabled: boolean) => void) {

        // Store callbacks
        this._onLoginRequired = loginRequired;
        this._onLoadStateChanged = onLoadStateChanged;

        // Initially we wait for both views to load
        this._mainViewLoaded = false;
        this._userInfoLoaded = false;

        // Initialise error state when getting data
        this._mainViewLoadError = null;
        this._userInfoLoadError = null;
        this._setupCallbacks();
    }

    /*
     * Session buttons are disabled while the main view loads
     */
    public onMainViewLoading() {
        this._onLoadStateChanged(false);
    }

    /*
     * After a successful load, reset error state and enable session buttons
     */
    public onMainViewLoaded() {
        this._mainViewLoaded = true;
        this._mainViewLoadError = null;
        this._onLoadStateChanged(true);
    }

    /*
     * After a failed load, store the error
     */
    public onMainViewLoadFailed(error: UIError) {
        this._mainViewLoaded = true;
        this._mainViewLoadError = error;
        this._triggerLoginIfRequired();
    }

    /*
     * After a successful user info load, reset error state
     */
    public onUserInfoLoaded() {
        this._userInfoLoaded = true;
        this._userInfoLoadError = null;
    }

    /*
     * After a failed user info load, store the error
     */
    public onUserInfoLoadFailed(error: UIError) {
        this._userInfoLoaded = true;
        this._userInfoLoadError = error;
        this._triggerLoginIfRequired();
    }

    /*
     * Indicate if there is an error
     */
    public hasError(): boolean {

        if ((this._mainViewLoadError && this._mainViewLoadError.errorCode !== ErrorCodes.loginRequired) ||
            (this._userInfoLoadError && this._userInfoLoadError.errorCode !== ErrorCodes.loginRequired)) {
                return true;
        }

        return false;
    }

    /*
     * Wait for both the main view and user info to load, then trigger a login redirect
     */
    private _triggerLoginIfRequired() {

        // First check both views are loaded
        if (this._mainViewLoaded && this._userInfoLoaded) {

            // Next check if there is one or more login required errors
            if ((this._mainViewLoadError && this._mainViewLoadError.errorCode === ErrorCodes.loginRequired) ||
                (this._userInfoLoadError && this._userInfoLoadError.errorCode === ErrorCodes.loginRequired)) {

                    // If so then ask the application to trigger a login redirect
                    this._onLoginRequired();
            }
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.onMainViewLoading = this.onMainViewLoading.bind(this);
        this.onMainViewLoaded = this.onMainViewLoaded.bind(this);
        this.onMainViewLoadFailed = this.onMainViewLoadFailed.bind(this);
        this.onUserInfoLoaded = this.onUserInfoLoaded.bind(this);
        this.onUserInfoLoadFailed = this.onUserInfoLoadFailed.bind(this);
    }
}
