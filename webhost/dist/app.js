"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const configurationLoader_1 = require("./configuration/configurationLoader");
const httpServerConfiguration_1 = require("./httpServerConfiguration");
const errorHandler_1 = require("./reverseProxy/errors/errorHandler");
const httpProxy_1 = require("./reverseProxy/utilities/httpProxy");
const logger_1 = require("./reverseProxy/utilities/logger");
/*
 * The web host entry point
 */
(async () => {
    // Initialize diagnostics
    logger_1.Logger.initialize();
    try {
        // First load configuration
        const loader = new configurationLoader_1.ConfigurationLoader();
        const configuration = await loader.load();
        // Initialize HTTP proxy behaviour so that we can view outbound OAuth requests
        httpProxy_1.HttpProxy.initialize(configuration.host.useHttpProxy, configuration.host.httpProxyUrl);
        // Create the web host
        const expressApp = express_1.default();
        const httpServer = new httpServerConfiguration_1.HttpServerConfiguration(expressApp, configuration);
        // Set up web static content delivery
        httpServer.initializeWebStaticContentHosting();
        // Initialise the web reverse proxy, used to enable token renewal for the SPA
        await httpServer.initializeReverseProxy();
        // Start listening for requests
        await httpServer.startListening();
    }
    catch (e) {
        // Report startup errors
        const error = errorHandler_1.ErrorHandler.fromException(e);
        logger_1.Logger.error(JSON.stringify(error.toLogFormat(), null, 2));
    }
})();
