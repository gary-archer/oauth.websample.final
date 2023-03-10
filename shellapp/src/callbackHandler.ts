import {Configuration} from './configuration';

/*
 * Handle requests to the /callback URL
 */
export class CallbackHandler {

    private readonly _configuration: Configuration;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
    }

    /*
     * When an OpenID Connect authorization response is received, forward it to the current micro UI
     */
    public execute(): void {

        // Get the micro UI that started the login
        const basePath = this._getStoredApplicationPath();

        // Get the authorization response query parameters for the micro UI path
        let returnUrl = `${location.origin}${basePath}`;
        if (location.pathname) {
            returnUrl += location.search;
        }

        // Remove this landing page from the browser history
        history.replaceState({}, document.title, '/');

        // Forward the authorization response to the micro UI
        location.href = returnUrl;
    }

    /*
     * Micro UIs store their base path before triggering a login redirect
     */
    private _getStoredApplicationPath(): string {

        const item = sessionStorage.getItem('login.appState');
        if (item) {

            const data = JSON.parse(item);
            if (data && data.basePath) {
                return data.basePath;
            }
        }

        return this._configuration.defaultAppBasePath;
    }
}
