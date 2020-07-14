/*
 * The development host application entry point
 */

import express from 'express';
import fs from 'fs-extra';
import {Configuration} from './proxy/configuration/configuration';
import {ErrorHandler} from './proxy/errors/errorHandler';
import {ApiLogger} from './proxy/utilities/apiLogger';
import {HttpProxy} from './proxy/utilities/httpProxy';
import {HttpServerConfiguration} from './httpServerConfiguration';

(async () => {

    // Initialize diagnostics
    ApiLogger.initialize();

    try {

        // First load configuration
        const configBuffer = await fs.readFile('config.localapi.json');
        const config = JSON.parse(configBuffer.toString()) as Configuration;

        // Initialize HTTP proxy behaviour
        HttpProxy.initialize(config.api.useProxy, config.api.proxyUrl);

        // Create the HTTP server
        const expressApp = express();
        const httpServer = new HttpServerConfiguration(expressApp, config);

        // The HTTP server delivers web static content on a developer PC
        httpServer.initializeWebStaticContentHosting();

        // The HTTP server runs a proxy API on a developer PC, to reduce components
        await httpServer.initializeProxyApi();

        // Start listening for requests
        await httpServer.startListening();

    } catch (e) {

        // Report startup errors
        const error = ErrorHandler.fromException(e);
        ApiLogger.error(JSON.stringify(error.toLogFormat()));
    }
})();

