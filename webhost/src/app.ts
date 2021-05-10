import express from 'express';
import {ConfigurationLoader} from './configuration/configurationLoader';
import {HttpServerConfiguration} from './httpServerConfiguration';

/*
 * The web host entry point
 */
(async () => {

    // First load configuration
    const loader = new ConfigurationLoader();
    const configuration = await loader.load();

    // Create the web host
    const expressApp = express();
    const httpServer = new HttpServerConfiguration(expressApp, configuration);

    // Set up web static content delivery
    httpServer.initializeWebStaticContentHosting();

    // Start listening for requests
    await httpServer.startListening();
})();

