"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServerConfiguration = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = require("express");
const fs_extra_1 = __importDefault(require("fs-extra"));
const https_1 = __importDefault(require("https"));
const router_1 = require("./reverseProxy/router");
const securityHeaders_1 = require("./securityHeaders");
const staticContent_1 = require("./staticContent");
/*
 * Configure web host behaviour at application startup
 */
class HttpServerConfiguration {
    constructor(expressApp, configuration) {
        this._expressApp = expressApp;
        this._configuration = configuration;
        this._reverseProxyRouter = new router_1.Router(this._configuration.reverseProxy);
        const securityHeaders = new securityHeaders_1.SecurityHeaders(this._configuration.securityHeaders);
        this._staticContent = new staticContent_1.StaticContent(this._configuration.host.mode, securityHeaders);
    }
    /*
     * Set up routes for web static content
     */
    initializeWebStaticContentHosting() {
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
    async initializeReverseProxy() {
        // Receive form URL encoded OAuth messages and also cookies
        this._expressApp.use('/reverse-proxy/*', express_1.urlencoded({ extended: true }));
        this._expressApp.use('/reverse-proxy/*', cookie_parser_1.default());
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
    async startListening() {
        const listenOptions = {
            port: this._configuration.host.port,
        };
        if (this._configuration.host.sslCertificateFileName && this._configuration.host.sslCertificatePassword) {
            // Set HTTPS server options
            const pfxFile = await fs_extra_1.default.readFile(this._configuration.host.sslCertificateFileName);
            const serverOptions = {
                pfx: pfxFile,
                passphrase: this._configuration.host.sslCertificatePassword,
            };
            // Start listening
            const httpsServer = https_1.default.createServer(serverOptions, this._expressApp);
            httpsServer.listen(listenOptions, () => {
                console.log(`Web Host is listening on HTTPS port ${listenOptions.port}`);
            });
        }
        else {
            // Otherwise listen over HTTP
            this._expressApp.listen(listenOptions, () => {
                console.log(`Web Host is listening on HTTP port ${listenOptions.port}`);
            });
        }
    }
    /*
     * Deal with Express unhandled promise exceptions during async API requests
     * https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
     */
    _catch(fn) {
        return (request, response, next) => {
            Promise
                .resolve(fn(request, response, next))
                .catch((e) => {
                this._reverseProxyRouter.unhandledExceptionHandler(e, request, response);
            });
        };
    }
}
exports.HttpServerConfiguration = HttpServerConfiguration;
