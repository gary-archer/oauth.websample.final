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
        async writeBundle() {
            await fs.copyFile(configurationFile, 'dist/spa.config.json');
        }
    };

    return plugin;
}

/*
 * Copy these resources to the output folder when they are edited
 */
export function copyOnEdit(): Plugin {

    const plugin: Plugin = {
        name: 'copy-on-edit',
        buildStart() {
            this.addWatchFile('index.html');
            this.addWatchFile('css');
            this.addWatchFile('spa.config.json');
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
        name: 'open-browser',
        writeBundle() {

            if (!isOpen) {

                isOpen = true;
                open('https://www.authsamples-dev.com/spa/');

            } else {

                fetch('https://www.authsamples-dev.com/reload');
            }
        }
    };

    return plugin;
}
