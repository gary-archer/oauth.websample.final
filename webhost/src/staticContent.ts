import {Request, Response} from 'express';
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
            this._webFilesRoot = '../../spa/dist';

        } else {

            // In Kubernetes the files are packaged to a subfolder of the web host
            this._webFilesRoot = '../spa';
        }
    }

    /*
     * Serve up a resource with an HTML based extension from its stored location, or default to serving index.html
     */
    public getWebResource(request: Request, response: Response): void {

        const extensions = [
            '.html',
            '.json',
            '.js',
            '.css',
        ];

        const requestPath = request.path.toLowerCase();
        const knownExtension = extensions.find((ext) => requestPath.endsWith(`${ext}`));

        const resourcePath = knownExtension ? requestPath.replace('/spa', '/') : 'index.html';
        const webFilePath = path.join(`${__dirname}/${this._webFilesRoot}/${resourcePath}`);

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
        this.getFavicon = this.getFavicon.bind(this);
    }
}
