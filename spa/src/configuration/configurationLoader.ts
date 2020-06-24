import axios from 'axios';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {AxiosUtils} from '../plumbing/utilities/axiosUtils';
import {Configuration} from './configuration';

/*
 * Logic related to making HTTP calls
 */
export class ConfigurationLoader {

    /*
     * Download JSON data from the app config file
     */
    public static async download(url: string): Promise<Configuration> {

        try {

            // Make the remote call
            const response = await axios.get<Configuration>(url);
            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (xhr) {

            // Capture error details
            throw ErrorHandler.getFromHttpError(xhr, url, 'Web Server');
        }
    }
}
