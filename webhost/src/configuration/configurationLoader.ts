import fs from 'fs-extra';
import {argv} from 'process';
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
        const data = JSON.parse(configurationBuffer.toString()) as Configuration;
        this._applyRuntimeParameters(data);
        return data;
    }

    /*
     * During development, if we are started with 'npm start localapi', point to the local API
     */
    private _applyRuntimeParameters(data: Configuration): void {

        if (argv.length > 2 && argv[2].toLowerCase() === 'localapi') {
            data.securityHeaders.contentSecurityPolicyHosts[0] = 'https://api.mycompany.com:444';
        }
    }
}
