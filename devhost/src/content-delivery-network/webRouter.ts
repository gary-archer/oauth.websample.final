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

    /*
     * Serve up the requested web file
     */
    public getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.replace('/spa2', '/');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
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
}
