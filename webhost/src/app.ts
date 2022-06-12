import express from 'express';
import fs from 'fs-extra';
import {Configuration} from './configuration';
import {HttpServerConfiguration} from './httpServerConfiguration';

/*
 * The web host entry point
 */
(async () => {

    // First load configuration
    const configurationBuffer = await fs.readFile('webhost.config.json');
    const configuration =  JSON.parse(configurationBuffer.toString()) as Configuration;

    // Create the web host
    const expressApp = express();
    const httpServer = new HttpServerConfiguration(expressApp, configuration);

    // Set up web static content delivery
    httpServer.initializeWebStaticContentHosting();

    // Start listening for requests
    await httpServer.startListening();
})();

