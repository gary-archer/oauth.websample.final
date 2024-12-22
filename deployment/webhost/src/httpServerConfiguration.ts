import {Application} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from './configuration.js';
import {ResponseHeaders} from './responseHeaders.js';
import {WebStaticContent} from './webStaticContent.js';

/*
 * Configure web host behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly express: Application;
    private readonly configuration: Configuration;
    private readonly webStaticContent: WebStaticContent;
    private readonly responseHeaders: ResponseHeaders;

    public constructor(expressApp: Application, configuration: Configuration) {

        this.express = expressApp;
        this.configuration = configuration;
        this.webStaticContent = new WebStaticContent(this.express);
        this.responseHeaders = new ResponseHeaders(this.configuration);
    }

    /*
     * Set up routes for web static content, and add recommended web headers to responses
     */
    public initialiseWebStaticContentHosting(): void {

        this.express.use('/*_', this.responseHeaders.add);
        this.webStaticContent.initialise();
    }

    /*
     * Start serving requests
     */
    public async startListening(): Promise<void> {

        if (this.configuration.sslCertificateFileName && this.configuration.sslCertificatePassword) {

            // Set HTTPS server options
            const pfxFile = await fs.readFile(this.configuration.sslCertificateFileName);
            const serverOptions = {
                pfx: pfxFile,
                passphrase: this.configuration.sslCertificatePassword,
            };

            // Start listening
            const httpsServer = https.createServer(serverOptions, this.express);
            httpsServer.listen(this.configuration.port, () => {
                console.log(`Web Host is listening on HTTPS port ${this.configuration.port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this.express.listen(this.configuration.port, () => {
                console.log(`Web Host is listening on HTTP port ${this.configuration.port}`);
            });
        }
    }
}
