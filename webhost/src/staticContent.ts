import {Request, Response} from 'express';
import path from 'path';
import {SecurityHeaders} from './securityHeaders';

// The relative path to web files
const WEB_FILES_ROOT = '../../spa';

/*
 * Manage static content delivery on a Developer PC or in Kubernetes
 */
export class StaticContent {

    private readonly _securityHeaders: SecurityHeaders;

    public constructor(securityHeaders: SecurityHeaders) {
        this._securityHeaders = securityHeaders;
        this._setupCallbacks();
    }

    /*
     * Serve up the requested web file
     */
    public getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.toLowerCase().replace('/spa', '/');
        if (resourcePath === '/') {
            resourcePath = 'index.html';
        }

        if (resourcePath.indexOf('spa.config') !== -1) {
            resourcePath = this._getWebConfigurationFile();
            this._addNoCacheHeaders(response);
        }

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/${resourcePath}`);
        this._securityHeaders.write(response);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested web file
     */
    public getDefaultDocument(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/index.html`);
        this._securityHeaders.write(response);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    public getFavicon(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/favicon.ico`);
        this._securityHeaders.write(response);
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
     * Disable caching when required
     */
    private _addNoCacheHeaders(response: Response) {

        response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', 0);
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.getWebResource = this.getWebResource.bind(this);
        this.getDefaultDocument = this.getDefaultDocument.bind(this);
        this.getFavicon = this.getFavicon.bind(this);
    }
}
