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
        await fs.copy('./spa.config.json', '.package/spa/spa.config.json');

        // HTML
        const root = '../../spa';
        await fs.copy(`${root}/index.html`,     '.package/spa/index.html');
        await fs.copy(`${root}/loggedout.html`, '.package/spa/loggedout.html');

        // Javascript
        await fs.copy(`${root}/dist/vendor.bundle.js`, '.package/spa/dist/vendor.bundle.js');
        await fs.copy(`${root}/dist/app.bundle.js`,    '.package/spa/dist/app.bundle.js');
        await fs.copy(`${root}/dist/unsupported.js`,   '.package/spa/dist/unsupported.js');
        await fs.copy(`${root}/dist/loggedout.js`,     '.package/spa/dist/loggedout.js');

        // CSS
        await fs.copy(`${root}/css/bootstrap.min.css`, '.package/spa/css/bootstrap.min.css');
        await fs.copy(`${root}/css/app.css`,           '.package/spa/css/app.css');
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