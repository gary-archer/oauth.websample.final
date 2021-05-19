import fs from 'fs-extra';
import {Configuration} from './configuration';

/*
 * A class to load the web host's configuration file
 */
export class ConfigurationLoader {

    /*
     * Return JSON data from the configuration file, and adjust if required
     */
    public async load(): Promise<Configuration> {

        const configurationBuffer = await fs.readFile('host.config.json');
        return JSON.parse(configurationBuffer.toString()) as Configuration;
    }
}
