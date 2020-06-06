import {Application, Request, Response} from 'express';
import * as path from 'path';

/*
 * The relative path to web files
 */
const WEB_FILES_ROOT = '../../spa';
const ANDROID_FILES_ROOT = '../../../authguidance.mobilewebview.android';
const IOS_FILES_ROOT = '../../../authguidance.mobilewebview.ios';

/*
 * Resolve web requests for static content
 */
export class WebStaticContent {

    private _expressApp: Application;
    private _spaConfig: any;

    public constructor(expressApp: Application, spaConfig: any) {
        this._expressApp = expressApp;
        this._spaConfig = spaConfig;
        this._getSpaConfigurationFile = this._getSpaConfigurationFile.bind(this);
    }

    /*
     * Set up routes
     */
    public configure(): void {

        // Disable caching
        this._expressApp.set('etag', false);

        // Define route values
        this._expressApp.get('/spa/spa.config.json', this._getSpaConfigurationFile);
        this._expressApp.get('/spa/*', this._getWebResource);
        this._expressApp.get('/spa', this._getWebRootResource);
        this._expressApp.get('/favicon.ico', this._getFavicon);
        this._expressApp.get('/android/*', this._getAndroidResource);
        this._expressApp.get('/ios/*', this._getIosResource);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.replace('/spa', '/');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
        }

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve the cloud configuration so that the SPA points to AWS
     */
    private _getSpaConfigurationFile(request: Request, response: Response): void {

        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(this._spaConfig));
    }

    /*
     * Serve up the requested web file
     */
    private _getWebRootResource(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/index.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    private _getFavicon(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/favicon.ico`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested Android file
     */
    private _getAndroidResource(request: Request, response: Response): void {

        const resourcePath = request.path.replace('/android', '/');
        const webFilePath = path.join(`${__dirname}/${ANDROID_FILES_ROOT}/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested IOS file
     */
    private _getIosResource(request: Request, response: Response): void {

        const resourcePath = request.path.replace('/ios', '/');
        const webFilePath = path.join(`${__dirname}/${IOS_FILES_ROOT}/${resourcePath}`);
        response.sendFile(webFilePath);
    }
}
