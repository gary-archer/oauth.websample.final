import compression from 'compression';
import express, {NextFunction, Request, Response} from 'express';
import fs from 'fs/promises';
import https from 'https';
import {Configuration} from './configuration.js';

// First load configuration
const configurationJson = await fs.readFile('webhost.config.json', 'utf-8');
const configuration =  JSON.parse(configurationJson) as Configuration;

// Create the web host
const app = express();

// Add compression middleware
app.use(compression());

// Add response headers middleware
app.use('/*_', responseHeadersMiddleware);

// Add static content middleware and handle not found paths
const spaBasePath = '/spa/';
const spaPhysicalRoot = './spa';
app.use(spaBasePath, express.static(spaPhysicalRoot));
app.get('*_', handleNotFoundPath);

// Configure the HTTP server
if (configuration.sslCertificateFileName && configuration.sslCertificatePassword) {

    // Set HTTPS server options
    const pfxFile = await fs.readFile(configuration.sslCertificateFileName);
    const serverOptions = {
        pfx: pfxFile,
        passphrase: configuration.sslCertificatePassword,
    };

    // Start listening
    const httpsServer = https.createServer(serverOptions, app);
    httpsServer.listen(configuration.port, () => {
        console.log(`Web Host is listening on HTTPS port ${configuration.port}`);
    });

} else {

    // Otherwise listen over HTTP
    app.listen(configuration.port, () => {
        console.log(`Web Host is listening on HTTP port ${configuration.port}`);
    });
}

/*
 * Set responses headers for static content requests
 */
function responseHeadersMiddleware(request: Request, response: Response, next: NextFunction): any {

    const trustedHosts = configuration.trustedHosts.join(' ');
    let policy = "default-src 'none';";
    policy += " script-src 'self';";
    policy += ` connect-src 'self' ${trustedHosts};`;
    policy += " child-src 'self';";
    policy += " img-src 'self';";
    policy += " style-src 'self';";
    policy += " object-src 'none';";
    policy += " frame-ancestors 'none';";
    policy += " base-uri 'self';";
    policy += " form-action 'self'";

    // Add security headers, including a restrictive content security policy
    response.setHeader('content-security-policy', policy);
    response.setHeader('strict-transport-security', 'max-age=31536000; includeSubdomains; preload');
    response.setHeader('x-frame-options', 'DENY');
    response.setHeader('x-xss-protection', '1; mode=block');
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('referrer-policy', 'same-origin');

    // Add cache headers to release builds to serve downloaded assets from the browser cache
    response.setHeader('cache-control', getCacheControlResponseHeader(request));
    next();
}

/*
 * Tell the browser to cache child assets that use cache busting timestamps, but not cache HTML files
 */
function getCacheControlResponseHeader(request: Request): string {

    const fullUrl = `${request.protocol}://${request.hostname}${request.originalUrl.toLowerCase()}`;
    const path = new URL(fullUrl).pathname;
    const extensions = [
        '.js',
        '.css',
        '.ico',
    ];

    const cacheableExtension = extensions.find((ext) => {
        return path.endsWith(`${ext}`);
    });

    if (cacheableExtension) {
        return 'public, max-age=31536000, immutable';
    } else {
        return 'no-cache, must-revalidate';
    }
}

/*
 * Handle paths that don't map to physical resources
 */
function handleNotFoundPath(request: Request, response: Response) {

    const requestPath = request.path.toLowerCase();
    if (requestPath === '/favicon.ico') {

        // Serve the root level favico.ico file
        const rootPhysicalPath = './';
        response.sendFile('favicon.ico', {root: rootPhysicalPath});

    } else if (requestPath.startsWith(spaBasePath)) {

        // Within the SPA serve the defeault document
        response.sendFile('index.html', {root: spaPhysicalRoot});

    } else {

        // For other paths, redirect to the SPA
        response.redirect(spaBasePath);
    }
}
