import fs from 'fs-extra';
import {Configuration} from './configuration';

/*
 * A class to load the configuration file
 */
export class ConfigurationLoader {

    /*
     * Download JSON data from the app config file
     */
    public async load(): Promise<Configuration> {

        const fileName = this._getConfigurationFileName();
        const configurationBuffer = await fs.readFile(fileName);
        return JSON.parse(configurationBuffer.toString()) as Configuration;
    }

    /*
     * Return the name of the configuration file to use, and default to running web content only
     */
    private _getConfigurationFileName(): string {

        const shortFileName = (process.env.DEV_CONFIG === 'localapi') ? 'localapi' : 'localweb';
        return `reverseproxy.config.${shortFileName}.json`;
    }
}
