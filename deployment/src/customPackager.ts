import fs from 'fs-extra';
import process from 'process';

class Packager {

    /*
     * Copy files into a folder that can be deployed directly to AWS
     */
    public async execute(): Promise<void> {

        // Clear from last time
        await fs.remove('.package');
        await fs.ensureDir('.package/spa');

        // Use the deployed configuration
        await fs.copy('../spa/spa.config.deployed.json', '.package/spa/spa.config.json');

        // HTML
        await fs.copy('../spa/index.html', '.package/spa/index.html');
        await fs.copy('../spa/loggedout.html', '.package/spa/loggedout.html');

        // Javascript
        await fs.copy('../spa/dist/vendor.bundle.js', '.package/spa/dist/vendor.bundle.js');
        await fs.copy('../spa/dist/app.bundle.js', '.package/spa/dist/app.bundle.js');

        // CSS
        await fs.copy('../spa/css/bootstrap.min.css', '.package/spa/css/bootstrap.min.css');
        await fs.copy('../spa/css/app.css', '.package/spa/css/app.css');

        // Images
        await fs.copy('../spa/images', '.package/spa/images');
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
