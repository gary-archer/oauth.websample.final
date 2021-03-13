import cookieParser from 'cookie-parser';
import {Application, NextFunction, Request, Response, urlencoded} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from './configuration/configuration';
import {Router} from './reverseProxy/router';
import {SecurityHeaders} from './securityHeaders';
import {StaticContent} from './staticContent';

/*
 * Configure web host behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _expressApp: Application;
    private readonly _configuration: Configuration;
    private readonly _reverseProxyRouter: Router;
    private readonly _staticContent: StaticContent;

    public constructor(expressApp: Application, configuration: Configuration) {

        this._expressApp = expressApp;
        this._configuration = configuration;
        this._reverseProxyRouter = new Router(this._configuration.reverseProxy);
        const securityHeaders = new SecurityHeaders(this._configuration.securityHeaders);
        this._staticContent = new StaticContent(securityHeaders);
    }

    /*
     * Set up routes for web static content
     */
    public initializeWebStaticContentHosting(): void {

        // Disable caching on a development PC
        this._expressApp.set('etag', false);

        // Define route values
        this._expressApp.get('/spa/spa.config.json', this._catch(this._staticContent.getWebConfiguration));
        this._expressApp.get('/spa/*', this._staticContent.getWebResource);
        this._expressApp.get('/spa', this._staticContent.getDefaultDocument);
        this._expressApp.get('/favicon.ico', this._staticContent.getFavicon);
    }

    /*
     * Set up routes for the reverse proxy API
     */
    public async initializeReverseProxy(): Promise<void> {

        // Receive form URL encoded OAuth messages and also cookies
        this._expressApp.use('/reverse-proxy/*', urlencoded({extended: true}));
        this._expressApp.use('/reverse-proxy/*', cookieParser());

        // Our main route forwards to the Authorization Server, then manages refresh tokens in cookies
        this._expressApp.post('/reverse-proxy/token', this._catch(this._reverseProxyRouter.tokenEndpoint));

        // Routes for testing and to remove cookies completely when the session expires
        this._expressApp.post('/reverse-proxy/expire', this._catch(this._reverseProxyRouter.expireRefreshToken));
        this._expressApp.delete('/reverse-proxy/token', this._catch(this._reverseProxyRouter.clearCookies));

        // Error routes
        this._expressApp.use('/reverse-proxy/*', this._reverseProxyRouter.notFoundHandler);
        this._expressApp.use('/reverse-proxy/*', this._reverseProxyRouter.unhandledExceptionHandler);
    }

    /*
     * Start serving requests
     */
    public async startListening(): Promise<void> {

        const hostConfiguration = this._configuration.host;

        // Set HTTPS server options
        const pfxFile = await fs.readFile(`certs/${hostConfiguration.sslCertificateFileName}`);
        const serverOptions = {
            pfx: pfxFile,
            passphrase: hostConfiguration.sslCertificatePassword,
        };

        // Set listener options
        const listenOptions = {
            port: hostConfiguration.sslPort,
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
                    this._reverseProxyRouter.unhandledExceptionHandler(e, request, response);
                });
        };
    }
}
