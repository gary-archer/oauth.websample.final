import cookieParser from 'cookie-parser';
import {Application, NextFunction, Request, Response, urlencoded} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {WebRouter} from './content-delivery-network/webRouter';
import {Configuration} from './reverse-proxy-api/configuration/configuration';
import {ApiRouter} from './reverse-proxy-api/routing/apiRouter';

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
        this._webRouter = new WebRouter();
    }

    /*
     * Set up routes for the reverse proxy API
     */
    public async initializeReverseProxyApi(): Promise<void> {

        // We don't want API requests to be cached unless explicitly designed for caching
        this._expressApp.set('etag', false);

        // Receive form URL encoded OAuth messages and also cookies
        this._expressApp.use('/reverse-proxy/*', urlencoded({extended: true}));
        this._expressApp.use('/reverse-proxy/*', cookieParser());

        // Our main route manages forwarding to the Authorization Server and issuing cookies
        this._expressApp.post('/reverse-proxy/token', this._catch(this._apiRouter.tokenEndpoint));

        // For testing we provide an endpoint to make the refresh token act as expired
        this._expressApp.post('/reverse-proxy/expire', this._catch(this._apiRouter.expireRefreshToken));

        // Error routes
        this._expressApp.use('/reverse-proxy/*', this._apiRouter.notFoundHandler);
        this._expressApp.use('/reverse-proxy/*', this._apiRouter.unhandledExceptionHandler);
    }

    /*
     * Set up routes for web content
     */
    public initializeWebStaticContentHosting(): void {

        // Disable caching on a development PC
        this._expressApp.set('etag', false);

        // Define route values
        this._expressApp.get(`/spa/spa.config.*`, this._webRouter.getSpaConfigurationFile);
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
            console.log(`Development Web Host is listening on HTTPS port ${listenOptions.port}`);
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
