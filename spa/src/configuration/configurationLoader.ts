import axios from 'axios';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {AxiosUtils} from '../plumbing/utilities/axiosUtils';
import {Configuration} from './configuration';

/*
 * A class to download configuration from the server
 */
export class ConfigurationLoader {

    /*
     * Download JSON data from the app config file
     */
    public async download(): Promise<Configuration> {

        const fileName = 'spa.config.json';
        try {

            // Make the remote call
            const response = await axios.get<Configuration>(fileName);
            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (xhr) {

            // Capture error details
            throw ErrorFactory.fromHttpError(xhr, fileName, 'Web Server');
        }
    }
}
