import express, {Application, Request, Response} from 'express';
import {Configuration} from './configuration.js';

/*
 * Serve the web static content for a brand composed of multiple micro-UIs
 */
export class WebStaticContent {

    private readonly _express: Application;
    private readonly _configuration: Configuration;

    public constructor(expressApp: Application, configuration: Configuration) {

        this._express = expressApp;
        this._configuration = configuration;
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

        const demoAppBasePath = '/demoapp/';
        const demoAppRoot = this._getDemoAppFilesBasePath();
        this._express.use(demoAppBasePath, express.static(demoAppRoot));
    }

    /*
     * Serve static files for the shell app
     */
    private _handleShellAppRequests(): void {

        const shellAppBasePath = '/';
        const shellAppRoot = this._getShellAppFilesBasePath();
        this._express.use(shellAppBasePath, express.static(shellAppRoot));
    }

    /*
     * Handle not found requests by returning its index.html for the micro UI
     */
    private _handleNotFoundRequest(request: Request, response: Response): void {

        const requestPath = request.path.toLowerCase();
        const demoAppBasePath = '/demoapp/';

        if (requestPath.startsWith(demoAppBasePath)) {

                    // Serve the demoapp index.html for other requests within that path
            const demoAppRoot = this._getDemoAppFilesBasePath();
            response.sendFile('index.html', {root: demoAppRoot});

        } else {

            // Serve the shellapp index.html for any other requests
            const shellAppRoot = this._getShellAppFilesBasePath();
            response.sendFile('index.html', {root: shellAppRoot});
        }
    }

    /*
     * Return the relative path to demo app web files
     */
    private _getDemoAppFilesBasePath(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../demoapp/dist';

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
            return '../shellapp/dist';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './shellapp';
        }
    }
}
