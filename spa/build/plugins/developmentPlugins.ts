import {Plugin} from 'rollup';
import open from 'open';

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
 * Open the browser when a development build completes
 */
let isOpen = false;
export function openBrowser(): Plugin {

    const plugin: Plugin = {
        name: 'copy-on-edit',
        writeBundle() {

            if (!isOpen) {
                isOpen = true;
                open('https://www.authsamples-dev.com/spa/');
            }
        }
    };

    return plugin;
}
