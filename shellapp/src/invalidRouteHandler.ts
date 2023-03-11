import {Configuration} from './configuration';

/*
 * Handle requests to invalid routes
 */
export class InvalidRouteHandler {

    private readonly _configuration: Configuration;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
    }

    public execute(): void {
        location.href = `${location.origin}${this._configuration.defaultAppBasePath}`;
    }
}
