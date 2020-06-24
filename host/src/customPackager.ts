import * as fs from 'fs-extra';
import * as process from 'process';

class Packager {

    /*
     * Copy files into a folder that is easier to deploy to AWS
     */
    public async execute(): Promise<void> {

        await fs.remove('.package');
        await fs.ensureDir('.package/spa');

        // Configuration
        await fs.copy('../spa/spa.config.json', '.package/spa/spa.config.json');
        await this._updateConfiguration('.package/spa/spa.config.json');

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

    /*
     * Before deploying to the cloud, overwrite the local development URL with the cloud version
     */
    private async _updateConfiguration(filePath: string): Promise<void> {

        // Read existing data
        const configBuffer = await fs.readFile(filePath);
        const spaConfig = JSON.parse(configBuffer.toString());

        // Replace the redirect URI
        spaConfig.oauth.appUri = 'https://web.authguidance-examples.com/spa/';

        // Write back the data
        const dataToWrite = JSON.stringify(spaConfig, null, 2)
        await fs.writeFile(filePath, dataToWrite);
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
