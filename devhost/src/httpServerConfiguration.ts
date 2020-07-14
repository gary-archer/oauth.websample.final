import cookieParser from 'cookie-parser';
import cors from 'cors';
import {Application, NextFunction, Request, Response, urlencoded} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from './oauth/configuration/configuration';
import {ApiRouter} from './oauth/routing/apiRouter';
import {WebRouter} from './web-content-delivery/webRouter';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _expressApp: Application;
    private readonly _configuration: Configuration;
    private readonly _apiRouter: ApiRouter;
    private readonly _webRouter: WebRouter;

    public constructor(expressApp: Application, configuration: Configuration) {
        this._expressApp = expressApp;
        this._configuration = configuration;
        this._apiRouter = new ApiRouter(this._configuration);
        this._webRouter = new WebRouter(this._configuration.web.configurationFileName);
    }

    /*
     * Set up routes for the OAuth utility API
     */
    public async initializeApi(): Promise<void> {

        // We don't want API requests to be cached unless explicitly designed for caching
        this._expressApp.set('etag', false);

        // Allow cross origin requests from the SPA
        const corsOptions = { origin: this._configuration.api.webTrustedOrigins };
        this._expressApp.use('/oauth2/*', cors(corsOptions));

        // Process form URL encoded data and cookies
        this._expressApp.use('/oauth2/*', urlencoded({extended: true}));
        this._expressApp.use('/oauth2/*', cookieParser());

        // Our single route manages forwarding to the Authorization Server and issuing cookies
        this._expressApp.post('/oauth2/token', this._catch(this._apiRouter.tokenEndpointProxy));

        // Error routes
        this._expressApp.use('/oauth2/*', this._apiRouter.notFoundHandler);
        this._expressApp.use('/oauth2/*', this._apiRouter.unhandledExceptionHandler);
    }

    /*
     * Set up routes for web content
     */
    public initializeWebStaticContentHosting(): void {

        // Disable caching on a development PC
        this._expressApp.set('etag', false);

        // Define route values
        const spaConfigFileName = this._configuration.web.configurationFileName;
        this._expressApp.get(`/spa/${spaConfigFileName}`, this._webRouter.getSpaConfigurationFile);
        this._expressApp.get('/spa/*', this._webRouter.getWebResource);
        this._expressApp.get('/spa', this._webRouter.getWebRootResource);
        this._expressApp.get('/favicon.ico', this._webRouter.getFavicon);
    }

    /*
     * Start serving requests
     */
    public async startListening(): Promise<void> {

        // Set HTTPS server options
        const pfxFile = await fs.readFile(`certs/${this._configuration.api.sslCertificateFileName}`);
        const serverOptions = {
            pfx: pfxFile,
            passphrase: this._configuration.api.sslCertificatePassword,
        };

        // Set listener options
        const listenOptions = {
            port: this._configuration.api.sslPort,
        };

        // Start listening
        const httpsServer = https.createServer(serverOptions, this._expressApp);
        httpsServer.listen(listenOptions, () => {

            // Render a startup message
            console.log(`Development Host is listening on HTTPS port ${listenOptions.port}`);
        });
    }

    /*
     * Deal with Express unhandled promise exceptions during async API requests
     * https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
     */
    private _catch(fn: any): any {

        return (request: Request, response: Response, next: NextFunction) => {

            Promise
                .resolve(fn(request, response, next))
                .catch((e) => {
                    this._apiRouter.unhandledExceptionHandler(e, request, response);
                });
        };
    }
}
