import compression from 'compression';
import express from 'express';
import fs from 'node:fs/promises';
import {Configuration} from './configuration.js';
import {HttpServerConfiguration} from './httpServerConfiguration.js';

// First load configuration
const configurationJson = await fs.readFile('webhost.config.json', 'utf-8');
const configuration =  JSON.parse(configurationJson) as Configuration;

// Create the web host and enable compression
const app = express();
app.use(compression());
const httpServer = new HttpServerConfiguration(app, configuration);

// Set up web static content delivery
httpServer.initialiseWebStaticContentHosting();

// Start listening for requests
await httpServer.startListening();
