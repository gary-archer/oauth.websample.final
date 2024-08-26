import express from 'express';
import fs from 'fs-extra';
import {Configuration} from './configuration.js';
import {HttpServerConfiguration} from './httpServerConfiguration.js';

// First load configuration
const configurationBuffer = await fs.readFile('webhost.config.json');
const configuration =  JSON.parse(configurationBuffer.toString()) as Configuration;

// Create the web host
const expressApp = express();
const httpServer = new HttpServerConfiguration(expressApp, configuration);

// Set up web static content delivery
httpServer.initialiseWebStaticContentHosting();

// Start listening for requests
await httpServer.startListening();
