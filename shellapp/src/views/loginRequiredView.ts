import {DomUtils} from '../utils/domUtils';

/*
 * Handle requests to the /loggedout URL
 */
export class LoginRequiredView {

    private readonly _loginAction: () => void;

    public constructor(loginAction: () => void) {

        this._loginAction = loginAction;
        this._setupCallbacks();
    }

    /*
     * Render a user message and login button
     */
    public render(): void {

        const html =
            `<div class='row'>
                <div class='col-12 my-auto'>
                    <h2>OAuth Demo App</h2>
               </div>
            </div>
            <div class='row'>
                <div class='col-12 text-center mx-auto'>
                    <h5>You are logged out, click Login to begin</h5>
                </div>
            </div>
            <div class='row'>
                <div class='col col-12 text-center my-2 p-1'>
                    <button id='btnLogin' type='button' class='btn btn-primary w-25 p-1'>Login</button>
                </div>
            </div>`;

        DomUtils.createDiv('#root', 'loginRequired');
        DomUtils.html('#loginRequired', html);
        DomUtils.onClick('#btnLogin', this._onLogin);
    }

    /*
     * Run the login action when the button is clicked
     */
    private _onLogin(): void {
        this._loginAction();
    }

    /*
     * Plumbing to ensure that the this parameter is available in callbacks
     */
    private _setupCallbacks(): void {
        this._onLogin = this._onLogin.bind(this);
    }
}
