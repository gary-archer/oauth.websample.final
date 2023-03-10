import {Configuration} from './configuration';
import {DomUtils} from './domUtils';

/*
 * Handle requests to the /loggedout URL
 */
export class LoginRequiredView {

    private readonly _configuration: Configuration;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
        this._setupCallbacks();
    }

    /*
     * Render a user message and login button
     */
    public render(): void {

        const html =
            `<div class='container'>
                <div class='row'>
                    <div class='col-8 my-auto'>
                        <h2>OAuth Demo App</h2>
                    </div>
                </div>
                <div class='row'>
                    <div class='col-12 text-center mx-auto'>
                        <h5>You have been successfully logged out</h5>
                    </div>
                </div>
                <div class='row'>
                    <div class='col col-one-fifth'></div>
                    <div class='col col-one-fifth'></div>
                    <div class='col col-one-fifth my-2 d-flex p-1'>
                        <button id='btnLogin' type='button' class='btn btn-primary w-100 p-1'>Login</button>
                    </div>
                    <div class='col col-one-fifth'></div>
                    <div class='col col-one-fifth'></div>
                </div>
            </div>`;

        DomUtils.createDiv('#root', 'loginRequired');
        DomUtils.html('#loginRequired', html);
        DomUtils.onClick('#btnLogin', this._onLogin);
    }

    /*
     * Handle the login click by navigating back to the default micro-UI within the overall web domain
     */
    private _onLogin(): void {
        location.href = `${location.origin}${this._configuration.defaultAppBasePath}`;
    }

    /*
     * Plumbing to ensure that the this parameter is available in callbacks
     */
    private _setupCallbacks(): void {
        this._onLogin = this._onLogin.bind(this);
    }
}
