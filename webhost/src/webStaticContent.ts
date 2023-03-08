import express, {Application, Request, Response} from 'express';
import serveStatic from 'serve-static';
import {Configuration} from './configuration.js';

/*
 * Serve the web static content for a brand composed of multiple micro-UIs
 */
export class WebStaticContent {

    private readonly _express: Application;
    private readonly _configuration: Configuration;
    private readonly _addSecurityHeaders: (response: Response) => any;

    public constructor(
        expressApp: Application,
        configuration: Configuration,
        addSecurityHeaders: (response: Response) => any) {

        this._express = expressApp;
        this._configuration = configuration;
        this._addSecurityHeaders = addSecurityHeaders;
    }

    public initialize(): void {

        // Handle micro UI requests
        this._handleMicroUIRequests();

        // Handle not found requests
        this._express.get('*', (request, response) => {

            // Not found requests within a micro UI path return its index.html file
            const isMicroUIRequest = this._handleNotFoundMicroUIRequest(request, response);
            if (!isMicroUIRequest) {

                // Requests to the minimal shell app return specific files
                const isValidRootRequest = this._handleRootRequest(request);
                if (!isValidRootRequest) {

                    // Otherwise return the index.html for the default micro UI
                    this._handleDefaultRequest(response);
                }
            }
        });
    }

    /*
     * Serve static files for micro UIs
     */
    private _handleMicroUIRequests(): void {

        const options: serveStatic.ServeStaticOptions<Response> = {
            setHeaders: this._addSecurityHeaders,
        };

        const demoAppBasePath = '/demoapp/';
        const demoAppRoot = this._getDemoAppFilesRoot();
        this._express.use(demoAppBasePath, express.static(demoAppRoot, options));
    }

    /*
     * Handle not found requests within a micro UI path by returning its index.html
     */
    private _handleNotFoundMicroUIRequest(request: Request, response: Response): boolean {

        const demoAppBasePath = '/demoapp/';
        if (request.path.toLowerCase().startsWith(demoAppBasePath)) {

            const demoAppRoot = this._getDemoAppFilesRoot();
            response.sendFile('index.html', {demoAppRoot});
            return true;
        }

        return false;
    }

    /*
     * The shell app only manages requests for the callback and loggedout paths
     */
    private _handleRootRequest(request: Request): boolean {

        const requestPath = request.path.toLowerCase();
        if (requestPath === '/loggedout' || requestPath === '/callback') {

            const shellRoot = this._getShellAppFilesRoot();
            this._express.use(request.path.toLowerCase(), express.static(`${shellRoot}/index.html`));
            return true;
        }

        if (requestPath === '/favicon.ico') {

            const shellRoot = this._getShellAppFilesRoot();
            this._express.use(request.path.toLowerCase(), express.static(`${shellRoot}${requestPath}`));
            return true;
        }

        return false;
    }

    /*
     * If we are in a path that is outside valid React paths for all micro UIs, redirect to the default app
     */
    private _handleDefaultRequest(response: Response) {

        const defaultAppBasePath = '/demoapp/';
        response.redirect(defaultAppBasePath);
    }

    /*
     * Return the relative path to shell app web files
     */
    private _getShellAppFilesRoot(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../dist/shellapp';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './shellapp';
        }
    }

    /*
     * Return the relative path to demo app web files
     */
    private _getDemoAppFilesRoot(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../dist/demoapp';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './demoapp';
        }
    }
}