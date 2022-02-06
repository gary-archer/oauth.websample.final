import {Application} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from './configuration/configuration';
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
        const securityHeaders = new SecurityHeaders(this._configuration.securityHeaders);
        this._staticContent = new StaticContent(this._configuration.host.mode, securityHeaders);
    }

    /*
     * Set up routes for web static content
     */
    public initializeWebStaticContentHosting(): void {

        this._expressApp.get('/spa/spa.config.json', this._staticContent.getWebConfiguration);
        this._expressApp.get('/spa/*', this._staticContent.getWebResource);
        this._expressApp.get('/spa', this._staticContent.getDefaultDocument);
        this._expressApp.get('/favicon.ico', this._staticContent.getFavicon);
    }

    /*
     * Start serving requests
     */
    public async startListening(): Promise<void> {

        if (this._configuration.host.sslCertificateFileName && this._configuration.host.sslCertificatePassword) {

            // Set HTTPS server options
            const pfxFile = await fs.readFile(this._configuration.host.sslCertificateFileName);
            const serverOptions = {
                pfx: pfxFile,
                passphrase: this._configuration.host.sslCertificatePassword,
            };

            // Start listening
            const httpsServer = https.createServer(serverOptions, this._expressApp);
            httpsServer.listen(this._configuration.host.port, () => {
                console.log(`Web Host is listening on HTTPS port ${this._configuration.host.port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this._expressApp.listen(this._configuration.host.port, () => {
                console.log(`Web Host is listening on HTTP port ${this._configuration.host.port}`);
            });
        }
    }
}
