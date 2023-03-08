import express, {Application, Request, Response} from 'express';
import serveStatic from 'serve-static';
import {Configuration} from './configuration.js';
import {SecurityHeaders} from './securityHeaders.js';

/*
 * Serve the web static content for a brand composed of multiple micro-UIs
 */
export class WebStaticContent {

    private readonly _express: Application;
    private readonly _configuration: Configuration;
    private readonly _securityHeaders: SecurityHeaders;

    public constructor(expressApp: Application, configuration: Configuration) {

        this._express = expressApp;
        this._configuration = configuration;
        this._securityHeaders = new SecurityHeaders(this._configuration);
    }

    /*
     * Handle physical resources in each micro UI, then serve index.html for not found requests
     */
    public initialize(): void {

        this._handleDemoAppRequests();
        this._handleShellAppRequests();

        this._express.get('*', (request, response) => {
            this._handleNotFoundRequest(request, response);
        });
    }

    /*
     * Serve static files for the demo app
     */
    private _handleDemoAppRequests(): void {

        const options: serveStatic.ServeStaticOptions<Response> = {
            setHeaders: this._securityHeaders.add,
        };

        const demoAppBasePath = '/demoapp/';
        const demoAppRoot = this._getDemoAppFilesBasePath();
        this._express.use(demoAppBasePath, express.static(demoAppRoot, options));
    }

    /*
     * Serve static files for the shell app
     */
    private _handleShellAppRequests(): void {

        const options: serveStatic.ServeStaticOptions<Response> = {
            setHeaders: this._securityHeaders.add,
        };

        const shellAppBasePath = '/';
        const shellAppRoot = this._getShellAppFilesBasePath();
        this._express.use(shellAppBasePath, express.static(shellAppRoot, options));
    }

    /*
     * Handle not found requests by returning its index.html for the micro UI
     */
    private _handleNotFoundRequest(request: Request, response: Response): void {

        const requestPath = request.path.toLowerCase();
        const demoAppBasePath = '/demoapp/';

        if (requestPath.startsWith(demoAppBasePath)) {

            // If within the demoapp micro-UI, return its index.html
            const demoAppRoot = this._getDemoAppFilesBasePath();
            response.sendFile('index.html', {root: demoAppRoot});

        } else if (requestPath === '/loggedout' || requestPath === '/callback') {

            // For these special routes, return the index.html for the shell app
            const shellAppRoot = this._getShellAppFilesBasePath();
            response.sendFile('index.html', {root: shellAppRoot});

        } else {

            // For any other invalid path, redirect to the default micro-UI
            response.redirect(demoAppBasePath);
        }
    }

    /*
     * Return the relative path to demo app web files
     */
    private _getDemoAppFilesBasePath(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../dist/demoapp';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './demoapp';
        }
    }

    /*
     * Return the relative path to root web files, for the shell app
     */
    private _getShellAppFilesBasePath(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../dist/shellapp';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './shellapp';
        }
    }
}
