import fs from 'fs-extra';
import {Configuration} from './configuration';

/*
 * A class to load the configuration file
 */
export class ConfigurationLoader {

    /*
     * Load JSON data from the app config file
     */
    public static async load(): Promise<Configuration> {

        const fileName = ConfigurationLoader._getConfigurationFileName();
        const configurationBuffer = await fs.readFile(fileName);
        return JSON.parse(configurationBuffer.toString()) as Configuration;
    }

    /*
     * Return the name of the configuration file to use, and default to running web content only
     */
    private static _getConfigurationFileName(): string {

        const prefix = (process.env.DEV_CONFIG === 'local') ? 'local' : 'deployed';
        return `config.${prefix}.json`;
    }
}
