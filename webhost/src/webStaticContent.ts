import express, {Application} from 'express';
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
    public initialise(): void {

        // Serve static files for the main SPA
        const spaBasePath = '/spa/';
        const spaRoot = this._getSpaFilesBasePath();
        this._express.use(spaBasePath, express.static(spaRoot));

        // Serve static files for the shell application
        const shellBasePath = '/';
        const shellRoot = this._getShellFilesBasePath();
        this._express.use(shellBasePath, express.static(shellRoot));

        // Handle not found requests by serving the index.html for the current micro-UI
        this._express.get('*', (request, response) => {

            const requestPath = request.path.toLowerCase();
            if (requestPath.startsWith(spaBasePath)) {
                response.sendFile('index.html', {root: spaRoot});

            } else {
                response.sendFile('index.html', {root: shellRoot});
            }
        });
    }

    /*
     * Return the relative path to the main SPA's web files
     */
    private _getSpaFilesBasePath(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../spa/dist';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './spa';
        }
    }

    /*
     * Return the relative path to root web files, for the shell application
     */
    private _getShellFilesBasePath(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../shell/dist';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './shell';
        }
    }
}
