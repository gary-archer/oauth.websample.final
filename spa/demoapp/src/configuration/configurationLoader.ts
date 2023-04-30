import axios from 'axios';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {AxiosUtils} from '../plumbing/utilities/axiosUtils';
import {Configuration} from './configuration';
import {productionCloudNativeConfiguration, productionServerlessConfiguration} from './productionConfiguration';

/*
 * A class to manage environment specific configuration
 */
export class ConfigurationLoader {

    public async get(): Promise<Configuration> {

        // Production configurations are coded into the app
        if (location.origin.toLowerCase() === 'https://web.authsamples.com') {
            return productionServerlessConfiguration;
        }

        if (location.origin.toLowerCase() === 'https://web.authsamples-k8s.com') {
            return productionCloudNativeConfiguration;
        }

        // Otherwise download the configuration, which enables us to spin up new environments without rebuilding code
        return this._download();
    }

    /*
     * Download JSON data from the app config file
     */
    private async _download(): Promise<Configuration> {

        const fileName = 'demoapp.config.json';
        const currentTime = new Date().getTime().toString();
        try {

            // Use a cache busting parameter to ensure that we always get the latest configuration
            const response = await axios.get<Configuration>(`${fileName}?t=${currentTime}`);
            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (xhr) {

            // Capture error details
            throw ErrorFactory.fromHttpError(xhr, fileName, 'Web Host');
        }
    }
}
