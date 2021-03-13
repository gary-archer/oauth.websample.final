import {Request, Response} from 'express';
import fs from 'fs-extra';
import path from 'path';
import {argv} from 'process';
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

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/${resourcePath}`);
        this._securityHeaders.write(response);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the configuration file and apply runtime parameters
     */
    public async getWebConfiguration(equest: Request, response: Response): Promise<void> {

        // Load the data
        const filePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/spa.config.json`);
        const configurationBuffer = await fs.readFile(filePath);
        const data = JSON.parse(configurationBuffer.toString());

        // During development, if we are started with 'npm start localapi', point to the local API
        if (argv.length > 2 && argv[2].toLowerCase() === 'localapi') {
            data.app.apiBaseUrl = 'https://api.mycompany.com:444/api';
        }

        // Write headers, and avoid caching this file during development
        this._securityHeaders.write(response);
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', 0);

        // Send JSON data to the browser
        response.status(200).send(JSON.stringify(data));
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
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.getWebResource = this.getWebResource.bind(this);
        this.getWebConfiguration = this.getWebConfiguration.bind(this);
        this.getDefaultDocument = this.getDefaultDocument.bind(this);
        this.getFavicon = this.getFavicon.bind(this);
    }
}
