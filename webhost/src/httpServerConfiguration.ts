import express, {Application, Response} from 'express';
import fs from 'fs-extra';
import https from 'https';
import serveStatic from 'serve-static';
import {Configuration} from './configuration.js';

/*
 * Configure web host behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _express: Application;
    private readonly _configuration: Configuration;

    public constructor(expressApp: Application, configuration: Configuration) {

        this._express = expressApp;
        this._configuration = configuration;
        this._setupCallbacks();
    }

    /*
     * Set up routes for web static content
     */
    public initializeWebStaticContentHosting(): void {

        const basePath = '/demoapp/';
        const root = this._getWebFilesRoot();

        // Serve static files and also include recommended security headers in the response
        const options: serveStatic.ServeStaticOptions<Response> = {
            setHeaders: this._addSecurityHeaders,
        };
        this._express.use(basePath, express.static(root, options));

        // Serve a favicon
        this._express.use('/favicon.ico', express.static(`${root}/favicon.ico`));

        // Handle invalid paths
        this._express.get('*', (request, response) => {

            if (!request.path.toLowerCase().startsWith(basePath)) {

                // If we are in a path where the React app will fail, return a redirect to a valid path
                response.redirect(basePath);

            } else {

                // Default to index.html otherwise
                response.sendFile('index.html', {root});
            }
        });
    }

    /*
     * Start serving requests
     */
    public async startListening(): Promise<void> {

        if (this._configuration.sslCertificateFileName && this._configuration.sslCertificatePassword) {

            // Set HTTPS server options
            const pfxFile = await fs.readFile(this._configuration.sslCertificateFileName);
            const serverOptions = {
                pfx: pfxFile,
                passphrase: this._configuration.sslCertificatePassword,
            };

            // Start listening
            const httpsServer = https.createServer(serverOptions, this._express);
            httpsServer.listen(this._configuration.port, () => {
                console.log(`Web Host is listening on HTTPS port ${this._configuration.port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this._express.listen(this._configuration.port, () => {
                console.log(`Web Host is listening on HTTP port ${this._configuration.port}`);
            });
        }
    }

    /*
     * Return the relative path to web files
     */
    private _getWebFilesRoot(): string {

        if (this._configuration.mode === 'development') {

            // During development, point to built SPA files
            return '../demoapp/dist';

        } else {

            // In Docker development setups, the files are packaged to a subfolder of the web host
            return './demoapp';
        }
    }

    /*
     * Add standard web security headers to the response to improve default browser secuirty
     */
    private _addSecurityHeaders(response: Response): any {

        // Prevent external sites being able to abuse the SPA's web origin
        const trustedHosts = this._configuration.trustedHosts.join(' ');
        let policy = "default-src 'none';";
        policy += " script-src 'self';";
        policy += ` connect-src 'self' ${trustedHosts};`;
        policy += " child-src 'self';";
        policy += " img-src 'self';";
        policy += " style-src 'self';";
        policy += " object-src 'none';";
        policy += " frame-ancestors 'none';";
        policy += " base-uri 'self';";
        policy += " form-action 'self'";

        // Add standard headers, including the content security policy
        response.setHeader('content-security-policy', policy);
        response.setHeader('strict-transport-security', 'max-age=63072000; includeSubdomains; preload');
        response.setHeader('x-frame-options', 'DENY');
        response.setHeader('x-xss-protection', '1; mode=block');
        response.setHeader('x-content-type-options', 'nosniff');
        response.setHeader('referrer-policy', 'same-origin');
    }

    /*
     * Plumbing to ensure that the this parameter is available in async events
     */
    private _setupCallbacks(): void {
        this._addSecurityHeaders = this._addSecurityHeaders.bind(this);
    }
}
