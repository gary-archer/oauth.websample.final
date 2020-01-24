import * as FileSystem from 'fs-extra';
import * as process from 'process';

class Packager {

    /*
     * Copy files into a folder that is easier to deploy to AWS
     */
    public async execute(): Promise<void> {

        await FileSystem.remove('.package');
        await FileSystem.ensureDir('.package/spa');

        // Configuration
        await FileSystem.copy('../spa/spa.config.json', '.package/spa/spa.config.json');

        // HTML
        await FileSystem.copy('../spa/index.html', '.package/spa/index.html');
        await FileSystem.copy('../spa/loggedout.html', '.package/spa/loggedout.html');

        // Javascript
        await FileSystem.copy('../spa/dist/vendor.bundle.js', '.package/spa/dist/vendor.bundle.js');
        await FileSystem.copy('../spa/dist/app.bundle.js', '.package/spa/dist/app.bundle.js');

        // CSS
        await FileSystem.copy('../spa/css/bootstrap.min.css', '.package/spa/css/bootstrap.min.css');
        await FileSystem.copy('../spa/css/app.css', '.package/spa/css/app.css');

        // Images
        await FileSystem.copy('../spa/images', '.package/spa/images');
    }
}

(async () => {
    try {
        const packager = new Packager();
        await packager.execute();
    } catch (e) {
        console.log(`Packaging error: ${e}`);
        process.exit(1);
    }
})();
