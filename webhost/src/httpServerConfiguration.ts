import {Application} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from './configuration';
import {SecurityHeaders} from './securityHeaders';
import {StaticContent} from './staticContent';

/*
 * Configure web host behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _expressApp: Application;
    private readonly _configuration: Configuration;
    private readonly _staticContent: StaticContent;

    public constructor(expressApp: Application, configuration: Configuration) {

        this._expressApp = expressApp;
        this._configuration = configuration;
        const securityHeaders = new SecurityHeaders(this._configuration);
        this._staticContent = new StaticContent(this._configuration.mode, securityHeaders);
    }

    /*
     * Set up routes for web static content
     */
    public initializeWebStaticContentHosting(): void {

        this._expressApp.get('/spa/*', this._staticContent.getWebResource);
        this._expressApp.get('/spa', this._staticContent.getWebResource);
        this._expressApp.get('/favicon.ico', this._staticContent.getFavicon);
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
            const httpsServer = https.createServer(serverOptions, this._expressApp);
            httpsServer.listen(this._configuration.port, () => {
                console.log(`Web Host is listening on HTTPS port ${this._configuration.port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this._expressApp.listen(this._configuration.port, () => {
                console.log(`Web Host is listening on HTTP port ${this._configuration.port}`);
            });
        }
    }
}
