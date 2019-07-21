import * as $ from 'jquery';
import {AppConfiguration} from '../configuration/appConfiguration';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {UrlHelper} from '../plumbing/utilities/urlHelper';
import {ErrorFragment} from './errorFragment';
import {ListView} from './listView';
import {LogoutView} from './logoutView';
import {TransactionsView} from './transactionsView';
import {UserInfoFragment} from './userInfoFragment';

/*
 * A very primitive router to deal with switching views
 */
export class Router {

    /*
     * Fields
     */
    private _configuration: AppConfiguration;
    private _authenticator: Authenticator;
    private _currentView: any;
    private _loadingState: boolean;

    /*
     * Initialize the current view
     */
    public constructor(configuration: AppConfiguration, authenticator: Authenticator) {
        this._configuration = configuration;
        this._authenticator = authenticator;

        // Switch to the loading state on application startup
        this._loadingState = false;
        this._updateControlsDuringLoad();
    }

    /*
     * Execute a view based on the hash URL data
     */
    public async executeView(): Promise<void> {

        // Switch to the loading state while loading a view
        this._updateControlsDuringLoad();

        // Get URL details
        const oldView = this._currentView;
        const hashData = UrlHelper.getLocationHashData();

        // Our simplistic routing works out which main view to show from a couple of known hash fragments
        if (hashData.loggedout) {

            // If the user has explicitly logged out show this view
            this._currentView = new LogoutView();
        } else {
            if (!hashData.company) {

                // Our simple UI shows the the list view by default
                this._currentView = new ListView(
                    this._authenticator,
                    this._configuration.apiBaseUrl);

            } else {

                // Otherwise it tries to render the transactions view for a specific company
                this._currentView = new TransactionsView(
                                        this._authenticator,
                                        this._configuration.apiBaseUrl,
                                        hashData.company);
            }
        }

        // Unload the old view
        if (oldView) {
            oldView.unload();
        }

        // Load the new view
        await this._currentView.execute();

        // Update controls unless logged out
        this._updateControlsAfterLoad();
    }

    /*
     * Show the user info child view unless we are logged out
     */
    public async executeUserInfoFragment(): Promise<void> {

        const hashData = UrlHelper.getLocationHashData();
        if (!hashData.loggedout) {
            const view = new UserInfoFragment(this._authenticator, this._configuration.apiBaseUrl);
            await view.execute();
        }
    }

    /*
     * Force a move to the home view after an error, so that we can retry
     */
    public moveHome() {

        // Force the location to always change so that the Home button forces a data refresh
        if (location.hash !== '#home') {
            location.hash = '#home';
        } else {
            location.hash = '#';
        }
    }

    /*
     * Update controls during busy processing and switch to a loading state
     */
    private _updateControlsDuringLoad(): void {

        if (!this._loadingState) {
            $('.initiallydisabled').prop('disabled', true);
            this._loadingState = true;
        }

        // Clear errors from the previous view
        const errorView = new ErrorFragment(this._configuration);
        errorView.clear();
    }

    /*
     * Update controls upon completion and remove the loading state
     */
    private _updateControlsAfterLoad(): void {

        if (this._loadingState) {
            $('.initiallydisabled').prop('disabled', false);
            this._loadingState = false;
        }
    }
}
