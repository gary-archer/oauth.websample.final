import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {UIError} from '../../plumbing/errors/uiError';
import {ApiViewNames} from './apiViewNames';

/*
 * A helper class to keep track of views that call APIs and whether a login_required error has been received
 */
export class ApiViewEvents {

    // A map of view names to their loaded state
    private _views: [string, boolean][];

    // An overall login required flag
    private _loginRequired: boolean;

    // Called back when all views have tried to load, if a login redirect is needed
    private readonly _onLoginRequiredAction: () => void;

    // Called back when the main view's load state changes
    private readonly _onMainLoadStateChanged: (enabled: boolean) => void;

    /*
     * Set the initial state at construction
     */
    public constructor(
        onLoginRequiredAction: () => void,
        onMainLoadStateChanged: (enabled: boolean) => void) {

        this._views = [];
        this._loginRequired = false;
        this._onLoginRequiredAction = onLoginRequiredAction;
        this._onMainLoadStateChanged = onMainLoadStateChanged;
        this._setupCallbacks();
    }

    /*
     * Each view is added along with an initial unloaded state
     */
    public addView(name: string): void {
        this._views.push([name, false]);
    }

    /*
     * Handle loading notifications, which will disable the header buttons
     */
    public onViewLoading(name: string): void {

        this._updateLoadState(name, false);

        if (name === ApiViewNames.Main) {
            this._onMainLoadStateChanged(false);
        }
    }

    /*
     * Update state when loaded, which may trigger a login redirect once all views are loaded
     */
    public onViewLoaded(name: string): void {

        this._updateLoadState(name, true);

        if (name === ApiViewNames.Main) {
            this._onMainLoadStateChanged(true);
        }

        this._triggerLoginIfRequired();
    }

    /*
     * Update state when there is a load error, which may trigger a login redirect once all views are loaded
     */
    public onViewLoadFailed(name: string, error: UIError): void {

        this._updateLoadState(name, true);

        if (error.errorCode === ErrorCodes.loginRequired) {
            this._loginRequired = true;
        }

        this._triggerLoginIfRequired();
    }

    /*
     * Reset state when the Reload Data button is clicked
     */
    public clearState(): void {
        this._views.forEach((i) => i[1] = false);
        this._loginRequired = false;
    }

    /*
     * Update whether a view has finished trying to load
     */
    private _updateLoadState(name: string, value: boolean) {

        const found = this._views.find(i => i[0] === name);
        if (found) {
            found[1] = value;
        }
    }

    /*
     * If all views are loaded and one or more has reported login required, then trigger a redirect
     */
    private _triggerLoginIfRequired(): void {

        const allViewsLoaded = this._views.filter(i => i[1] === true).length === this._views.length;
        if (allViewsLoaded && this._loginRequired) {
            console.log(`*** Views length is ${this._views.length}`);
            console.log('*** Trigger Login Required');
            this._onLoginRequiredAction();
        }
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
