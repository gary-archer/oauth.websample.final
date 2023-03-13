import {Configuration} from '../configuration/configuration';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {LoginRequiredView} from './loginRequiredView';

/*
 * Run logic depending on the current route within the shell application
 */
export class Router {

    private readonly _configuration: Configuration;
    private readonly _authenticator: Authenticator;

    public constructor(configuration: Configuration, authenticator: Authenticator) {
        this._configuration = configuration;
        this._authenticator = authenticator;
    }

    /*
     * Return true if a micro UI has asked to move to the login view
     */
    public isLoginRequest(): boolean {
        return (location.pathname.toLowerCase() === '/login');
    }

    /*
     * Return true if a micro UI has asked to move to the logged out view
     */
    public isLoggedOutRequest(): boolean {
        return (location.pathname.toLowerCase() === '/loggedout');
    }

    /*
     * If at this location, render a simple logged out view
     */
    public renderLoginRequiredView(isAfterLogout: boolean): void {

        const view = new LoginRequiredView(isAfterLogout, this._authenticator.login);
        view.render();
    }

    /*
     * Return true if this path has been requested by a micro UI
     */
    public isLogoutRequest(): boolean {
        return (location.pathname.toLowerCase() === '/logout');
    }

    /*
     * The default action once authenticated is to redirect to the default application
     */
    public redirectToDefaultApplication(): void {
        location.href = `${location.origin}${this._configuration.defaultAppBasePath}`;
    }
}
