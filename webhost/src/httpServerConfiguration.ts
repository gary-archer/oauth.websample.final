import {Application} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from './configuration.js';
import {SecurityHeaders} from './securityHeaders.js';
import {WebStaticContent} from './webStaticContent.js';

/*
 * Configure web host behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _express: Application;
    private readonly _configuration: Configuration;
    private readonly _webStaticContent: WebStaticContent;
    private readonly _securityHeaders: SecurityHeaders;

    public constructor(expressApp: Application, configuration: Configuration) {

        this._express = expressApp;
        this._configuration = configuration;
        this._webStaticContent = new WebStaticContent(this._express, this._configuration);
        this._securityHeaders = new SecurityHeaders(this._configuration);
    }

    /*
     * Set up routes for web static content, and add recommended web security headers to responses
     */
    public initialiseWebStaticContentHosting(): void {

        this._express.use('/*', this._securityHeaders.add);
        this._webStaticContent.initialise();
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
}
