import {Application, Response} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from './configuration.js';
import {WebStaticContent} from './webStaticContent.js';

/*
 * Configure web host behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _express: Application;
    private readonly _configuration: Configuration;
    private readonly _webStaticContent: WebStaticContent;

    public constructor(expressApp: Application, configuration: Configuration) {

        this._express = expressApp;
        this._configuration = configuration;
        this._webStaticContent = new WebStaticContent(this._express, this._configuration, this._addSecurityHeaders);
        this._setupCallbacks();
    }

    /*
     * Set up routes for web static content
     */
    public initializeWebStaticContentHosting(): void {
        this._webStaticContent.initialize();
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
