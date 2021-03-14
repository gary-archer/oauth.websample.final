"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticContent = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const process_1 = require("process");
/*
 * Manage static content delivery on a Developer PC or in Kubernetes
 */
class StaticContent {
    constructor(mode, securityHeaders) {
        this._securityHeaders = securityHeaders;
        this._setupCallbacks();
        if (mode === 'development') {
            // During development we get files from the SPA folder, for convenience
            this._webFilesRoot = '../../spa';
        }
        else {
            // In Kubernetes the files are packaged to a subfolder of the web host
            this._webFilesRoot = '../spa';
        }
    }
    /*
     * Serve up the requested web file
     */
    getWebResource(request, response) {
        let resourcePath = request.path.toLowerCase().replace('/spa', '/');
        if (resourcePath === '/') {
            resourcePath = 'index.html';
        }
        const webFilePath = path_1.default.join(`${__dirname}/${this._webFilesRoot}/${resourcePath}`);
        this._securityHeaders.write(response);
        response.sendFile(webFilePath);
    }
    /*
     * Serve up the configuration file and apply runtime parameters
     */
    async getWebConfiguration(equest, response) {
        // Load the data
        const filePath = path_1.default.join(`${__dirname}/${this._webFilesRoot}/spa.config.json`);
        const configurationBuffer = await fs_extra_1.default.readFile(filePath);
        const data = JSON.parse(configurationBuffer.toString());
        // During development, if we are started with 'npm start localapi', point to the local API
        if (process_1.argv.length > 2 && process_1.argv[2].toLowerCase() === 'localapi') {
            data.app.apiBaseUrl = 'https://api.mycompany.com:444/api';
        }
        // Write headers, and avoid caching this file during development
        this._securityHeaders.write(response);
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', 0);
        // Send JSON data to the browser
        response.status(200).send(JSON.stringify(data));
    }
    /*
     * Serve up the requested web file
     */
    getDefaultDocument(request, response) {
        const webFilePath = path_1.default.join(`${__dirname}/${this._webFilesRoot}/index.html`);
        this._securityHeaders.write(response);
        response.sendFile(webFilePath);
    }
    /*
     * Serve up our favicon
     */
    getFavicon(request, response) {
        const webFilePath = path_1.default.join(`${__dirname}/${this._webFilesRoot}/favicon.ico`);
        this._securityHeaders.write(response);
        response.sendFile(webFilePath);
    }
    /*
     * Set up async callbacks
     */
    _setupCallbacks() {
        this.getWebResource = this.getWebResource.bind(this);
        this.getWebConfiguration = this.getWebConfiguration.bind(this);
        this.getDefaultDocument = this.getDefaultDocument.bind(this);
        this.getFavicon = this.getFavicon.bind(this);
    }
}
exports.StaticContent = StaticContent;
