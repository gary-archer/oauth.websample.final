import cookieParser from 'cookie-parser';
import cors from 'cors';
import {Application, NextFunction, Request, Response, urlencoded} from 'express';
import fs from 'fs-extra';
import https, {ServerOptions} from 'https';
import tls from 'tls';
import {Configuration} from '../configuration/configuration';
import {Router} from '../routing/router';
import {ApiLogger} from '../utilities/apiLogger';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _expressApp: Application;
    private readonly _configuration: Configuration;
    private readonly _router: Router;

    public constructor(expressApp: Application, configuration: Configuration) {
        this._expressApp = expressApp;
        this._configuration = configuration;
        this._router = new Router(this._configuration);
    }

    /*
     * Set up Web API routes and initialize the API
     */
    public async initializeApi(): Promise<void> {

        // We don't want API requests to be cached unless explicitly designed for caching
        this._expressApp.set('etag', false);

        // Allow cross origin requests from the SPA
        const corsOptions = { origin: this._configuration.web.trustedOrigins };
        this._expressApp.use('/oauth2/*', cors(corsOptions));

        // Process form URL encoded data and cookies
        this._expressApp.use('/oauth2/*', urlencoded({extended: true}));
        this._expressApp.use('/oauth2/*', cookieParser());

        // Our single route manages forwarding to the Authorization Server and issuing cookies
        this._expressApp.post('/oauth2/token', this._catch(this._router.tokenEndpointProxy));

        // Error routes
        this._expressApp.use('/oauth2/*', this._router.notFoundHandler);
        this._expressApp.use('/oauth2/*', this._router.unhandledExceptionHandler);
    }

    /*
     * Start serving requests
     */
    public async startListening(): Promise<void> {

        // Load the certificate file from disk
        const pfxFile = await fs.readFileSync(`certs/${this._configuration.api.sslCertificateFileName}`);

        // http://nodejs.md/blog/https-server-with-multiple-domains-on-same-port-and-instance/
        const ctx = tls.createSecureContext({
            pfx: pfxFile,
            passphrase: this._configuration.api.sslCertificatePassword,
        })

        // Look at using an in process HTTP proxy???
        // https://github.com/http-party/node-http-proxy/issues/596

        const serverOptions = {
            pfx: pfxFile,
            passphrase: this._configuration.api.sslCertificatePassword,
            SNICallback: (serverName: string, callback) => {

                if (serverName === 'proxy.mycompany.com') {
                    callback(null, ctx);
                }
            },
        } as ServerOptions;

        // Set listen options to enable us to run this at the same time as our API
        const listenOptions = {
            port: 443,
        };

        // Start listening on HTTPS
        const httpsServer = https.createServer(serverOptions, this._expressApp);
        httpsServer.listen(listenOptions, () => {

            // Show a startup message
            ApiLogger.info(`Reverse proxy is listening on HTTP port ${listenOptions.port}`);
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
                    this._router.unhandledExceptionHandler(e, request, response);
                });
        };
    }
}
