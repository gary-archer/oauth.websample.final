import {Configuration} from './configuration';

/*
 * Handle OpenID Connect login responses
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

        // Get the stored path in the micro UI that started the login
        const applicationPath = this._getStoredApplicationPath();

        // Add the OpenID connect response query parameters with the authorization code
        let returnUrl = `${location.origin}${applicationPath}`;
        if (location.search) {
            returnUrl += location.search;
        }

        // Forward the authorization response to the micro UI
        location.href = returnUrl;
    }

    /*
     * Micro UIs store their current path before triggering a login redirect
     */
    private _getStoredApplicationPath(): string {

        const item = sessionStorage.getItem('login.state');
        if (item) {

            const data = JSON.parse(item);
            if (data && data.path) {
                return data.path;
            }
        }

        return this._configuration.defaultAppBasePath;
    }
}
