import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {Configuration} from './configuration';
import {productionCloudNativeConfiguration, productionServerlessConfiguration} from './productionConfiguration';

/*
 * A class to manage environment specific configuration
 */
export class ConfigurationLoader {

    public async get(): Promise<Configuration> {

        // Production configurations are coded into the app
        if (location.origin.toLowerCase() === 'https://www.authsamples.com') {
            return productionServerlessConfiguration;
        }

        if (location.origin.toLowerCase() === 'https://www.authsamples-k8s.com') {
            return productionCloudNativeConfiguration;
        }

        // Otherwise download the configuration, which enables us to spin up new environments without rebuilding code
        return this.download();
    }

    /*
     * Download JSON data from the app config file
     * Use a cache busting parameter to ensure that we always get the latest configuration
     */
    private async download(): Promise<Configuration> {

        const fileName = 'spa.config.json';
        const currentTime = new Date().getTime().toString();
        const url = `${fileName}?t=${currentTime}`;

        try {

            const response = await fetch(url);
            if (response.ok) {
                return await response.json() as Configuration;
            }

            throw await ErrorFactory.getFromFetchResponseError(response, 'web host');

        } catch (e: any) {

            throw ErrorFactory.getFromFetchError(e, url, 'web host');
        }
    }
}
