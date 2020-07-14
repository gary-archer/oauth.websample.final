import express from 'express';
import fs from 'fs-extra';
import {Configuration} from '../configuration/configuration';
import {ErrorHandler} from '../errors/errorHandler';
import {ApiLogger} from '../utilities/apiLogger';
import {HttpProxy} from '../utilities/httpProxy';
import {HttpServerConfiguration} from './httpServerConfiguration';

(async () => {

    // Initialize diagnostics
    ApiLogger.initialize();

    try {

        // First load configuration
        const apiConfigBuffer = await fs.readFile('api.config.json');
        const apiConfig = JSON.parse(apiConfigBuffer.toString()) as Configuration;

        // Initialize HTTP debugging
        HttpProxy.initialize(apiConfig.api.useProxy, apiConfig.api.proxyUrl);

        // Next configure web server behaviour
        const expressApp = express();
        const httpServer = new HttpServerConfiguration(expressApp, apiConfig);
        await httpServer.initializeApi();

        // Start receiving requests
        await httpServer.startListening();

    } catch (e) {

        // Report startup errors
        const error = ErrorHandler.fromException(e);
        ApiLogger.error(JSON.stringify(error.toLogFormat()));
    }
})();
