import {Request, Response} from 'express';
import fs from 'fs-extra';
import path from 'path';
import {SecurityHeaders} from './securityHeaders';

/*
 * Manage static content delivery on a Developer PC or in Kubernetes
 */
export class StaticContent {

    private readonly _webFilesRoot: string;
    private readonly _securityHeaders: SecurityHeaders;

    public constructor(mode: string, securityHeaders: SecurityHeaders) {
        this._securityHeaders = securityHeaders;
        this._setupCallbacks();

        if (mode === 'development') {

            // During development we get files from the SPA folder, for convenience
            this._webFilesRoot = '../../spa';

        } else {

            // In Kubernetes the files are packaged to a subfolder of the web host
            this._webFilesRoot = '../spa';
        }
    }

    /*
     * Serve up the requested web file
     */
    public getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.toLowerCase().replace('/spa', '/');
        if (resourcePath === '/') {
            resourcePath = 'index.html';
        }

        const webFilePath = path.join(`${__dirname}/${this._webFilesRoot}/${resourcePath}`);
        this._securityHeaders.write(response);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the configuration file and apply runtime parameters
     */
    public async getWebConfiguration(equest: Request, response: Response): Promise<void> {

        // Load the data
        const filePath = path.join(`${__dirname}/${this._webFilesRoot}/spa.config.json`);
        const configurationBuffer = await fs.readFile(filePath);
        const data = JSON.parse(configurationBuffer.toString());

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

        const webFilePath = path.join(`${__dirname}/${this._webFilesRoot}/index.html`);
        this._securityHeaders.write(response);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    public getFavicon(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${this._webFilesRoot}/favicon.ico`);
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
