import fs from 'fs/promises';
import {Plugin} from 'rollup';
import open from 'open';

/*
 * When a JavaScript build completes, copy the correct configuration file to the output folder
 */
export function copyConfiguration(): Plugin {

    const configurationFile = process.env.LOCALAPI === 'true' ?
        './deployment/environments/dev-localapi/spa.config.json' :
        './deployment/environments/dev/spa.config.json';

    const plugin: Plugin = {

        name: 'copy-configuration',
        async writeBundle(): Promise<void> {
            await fs.copyFile(configurationFile, 'dist/spa.config.json');
        }
    };

    return plugin;
}

/*
 * Open the browser when the first development build completes, or notify it to reload
 */
let isOpen = false;
export function notifyBrowser(): Plugin {

    const plugin: Plugin = {
        name: 'notify-browser',
        async writeBundle(): Promise<void> {

            const webHostUrl = 'https://www.authsamples-dev.com';
            if (!isOpen) {

                isOpen = true;
                open(`${webHostUrl}/spa/`);

            } else {

                await fetch(`${webHostUrl}/reload`);
            }
        }
    };

    return plugin;
}
