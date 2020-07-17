/*
 * The development host application entry point
 */

import express from 'express';
import {HttpServerConfiguration} from './httpServerConfiguration';
import {ConfigurationLoader} from './web-reverse-proxy/configuration/configurationLoader';
import {ErrorHandler} from './web-reverse-proxy/errors/errorHandler';
import {ApiLogger} from './web-reverse-proxy/utilities/apiLogger';
import {HttpProxy} from './web-reverse-proxy/utilities/httpProxy';

(async () => {

    // Initialize diagnostics
    ApiLogger.initialize();

    try {

        // First load configuration
        const loader = new ConfigurationLoader();
        const configuration = await loader.load();

        // Initialize HTTP proxy behaviour
        HttpProxy.initialize(configuration.useHttpProxy, configuration.httpProxyUrl);

        // Create the HTTP server
        const expressApp = express();
        const httpServer = new HttpServerConfiguration(expressApp, configuration);

        // The HTTP server delivers web static content on a developer PC
        httpServer.initializeWebStaticContentHosting();

        // The HTTP server runs a proxy API on a developer PC, to reduce components
        await httpServer.initializeReverseProxyApi();

        // Start listening for requests
        await httpServer.startListening();

    } catch (e) {

        // Report startup errors
        const error = ErrorHandler.fromException(e);
        ApiLogger.error(JSON.stringify(error.toLogFormat(), null, 2));
    }
})();

