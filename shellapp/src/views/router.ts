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
     * Return true if this path has been requested by a micro UI
     */
    public isLoginRequest(): boolean {
        return (location.pathname.toLowerCase() === '/login');
    }

    /*
     * Return true if this path has been requested by a micro UI
     */
    public isLogoutRequest(): boolean {
        return (location.pathname.toLowerCase() === '/logout');
    }

    /*
     * If at this location, render a simple logged out view
     */
    public renderLoginRequiredView(): void {

        const view = new LoginRequiredView(this._authenticator.login);
        view.render();
    }

    /*
     * The default action once authenticated is to redirect to the default application
     */
    public redirectToDefaultApplication(): void {
        location.href = `${location.origin}${this._configuration.defaultAppBasePath}`;
    }
}
