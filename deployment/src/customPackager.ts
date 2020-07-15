import * as fs from 'fs-extra';
import * as process from 'process';

class Packager {

    /*
     * Copy files into a folder that can be deployed directly to AWS
     */
    public async execute(): Promise<void> {

        // Clear from last time
        await fs.remove('.package');
        await fs.ensureDir('.package/spa2');

        // Use the deployed configuration
        await fs.copy('../spa/spa.config.deployed.json', '.package/spa2/spa.config.deployed.json');

        // HTML
        await fs.copy('../spa/index.html', '.package/spa2/index.html');
        await fs.copy('../spa/loggedout.html', '.package/spa2/loggedout.html');

        // Javascript
        await fs.copy('../spa/dist/vendor.bundle.js', '.package/spa2/dist/vendor.bundle.js');
        await fs.copy('../spa/dist/app.bundle.js', '.package/spa2/dist/app.bundle.js');

        // CSS
        await fs.copy('../spa/css/bootstrap.min.css', '.package/spa2/css/bootstrap.min.css');
        await fs.copy('../spa/css/app.css', '.package/spa2/css/app.css');

        // Images
        await fs.copy('../spa/images', '.package/spa2/images');
    }
}

(async () => {
    try {

        // Run the packager
        const packager = new Packager();
        await packager.execute();

    } catch (e) {

        // Do basic error reporting to the console
        console.log(`Packaging error: ${e}`);
        process.exit(1);
    }
})();
