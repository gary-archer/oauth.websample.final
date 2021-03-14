import express from 'express';
import {ConfigurationLoader} from './configuration/configurationLoader';
import {HttpServerConfiguration} from './httpServerConfiguration';
import {ErrorHandler} from './reverseProxy/errors/errorHandler';
import {HttpProxy} from './reverseProxy/utilities/httpProxy';
import {Logger} from './reverseProxy/utilities/logger';

/*
 * The web host entry point
 */
(async () => {

    // Initialize diagnostics
    Logger.initialize();

    try {

        // First load configuration
        const loader = new ConfigurationLoader();
        const configuration = await loader.load();

        // Initialize HTTP proxy behaviour so that we can view outbound OAuth requests
        HttpProxy.initialize(configuration.host.useHttpProxy, configuration.host.httpProxyUrl);

        // Create the web host
        const expressApp = express();
        const httpServer = new HttpServerConfiguration(expressApp, configuration);

        // Set up web static content delivery
        httpServer.initializeWebStaticContentHosting();

        // Initialise the web reverse proxy, used to enable token renewal for the SPA
        await httpServer.initializeReverseProxy();

        // Start listening for requests
        await httpServer.startListening();

    } catch (e) {

        // Report startup errors
        const error = ErrorHandler.fromException(e);
        Logger.error(JSON.stringify(error.toLogFormat(), null, 2));
    }
})();

