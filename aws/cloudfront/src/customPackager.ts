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
        await fs.copy(`${root}/dist/index.html`,     '.package/spa/index.html');

        // Javascript
        await fs.copy(`${root}/dist/vendor.bundle.js`, '.package/spa/vendor.bundle.js');
        await fs.copy(`${root}/dist/app.bundle.js`,    '.package/spa/app.bundle.js');

        // CSS
        await fs.copy(`${root}/dist/bootstrap.min.css`, '.package/spa/bootstrap.min.css');
        await fs.copy(`${root}/dist/app.css`,           '.package/spa/app.css');
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