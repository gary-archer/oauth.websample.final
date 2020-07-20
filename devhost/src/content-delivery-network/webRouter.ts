import {Request, Response} from 'express';
import path from 'path';

/*
 * The relative path to web files
 */
const WEB_FILES_ROOT = '../../../spa';

/*
 * A very basic CDN to run on a developer PC, whereas a real world solution would use something like AWS Cloudfront
 */
export class WebRouter {

    public constructor() {
        this._setupCallbacks();
    }

    /*
     * Serve up the requested web file
     */
    public getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.toLowerCase().replace('/spa2', '/');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
        }

        if (resourcePath.indexOf('spa.config') !== -1) {
            resourcePath = this._getWebConfigurationFile();
        }

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested web file
     */
    public getWebRootResource(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/index.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    public getFavicon(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/favicon.ico`);
        response.sendFile(webFilePath);
    }

    /*
     * Download the web configuration file based on the environment
     */
    private _getWebConfigurationFile() {

        // This option on a developer PC is used to host web content and point to an API on the developer PC
        if (process.env.DEV_CONFIG === 'localapi') {
            return `spa.config.${process.env.DEV_CONFIG}.json`;
        }

        // By default we run web content on the developer PC and point to a Cloud API
        return 'spa.config.localweb.json';
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.getWebResource = this.getWebResource.bind(this);
    }
}
