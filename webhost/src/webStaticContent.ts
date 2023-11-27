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

        // Handle not found requests
        this._express.get('*', (request, response) => {

            const requestPath = request.path.toLowerCase();
            if (requestPath === '/favicon.ico') {

                // Serve the root level favico.ico file
                const root = this._getRootFilesBasePath();
                response.sendFile('favicon.ico', {root});

            } else if (requestPath.startsWith(spaBasePath)) {

                // Within the SPA serve the defeault document
                response.sendFile('index.html', {root: spaRoot});

            } else {

                // For other paths, redirect to the SPA
                response.redirect(spaBasePath);
            }
        });
    }

    /*
     * Return the relative path to the root folder containing the favicon.ico file
     */
    private _getRootFilesBasePath(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../spa';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './';
        }
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
}
