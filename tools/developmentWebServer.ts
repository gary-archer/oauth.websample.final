import express, {NextFunction, Request, Response} from 'express';
import fs from 'fs/promises';
import https from 'https';
import {WebSocketServer, WebSocket} from 'ws';

/*
 * First load configuration
 */
interface Configuration {
    hostname: string,
    port: number;
    sslCertificateFileName: string;
    sslCertificatePassword: string;
    trustedHosts: string[];
}

const configurationFolder = process.env.LOCALAPI ?
    './deployment/environments/dev-localapi' :
    './deployment/environments/dev';

const configurationJson = await fs.readFile(`${configurationFolder}/webhost.config.json`, 'utf-8');
const configuration =  JSON.parse(configurationJson) as Configuration;

/*
 * Create the Express host and set a strong content security policy
 */
const app = express();
app.use('/*_', setSecurityHeaders);

/*
 * Load SSL certificate files from disk
 */
const pfxData = await fs.readFile(configuration.sslCertificateFileName);
const httpsOptions = {
    pfx: pfxData,
    passphrase: configuration.sslCertificatePassword,
};

/*
 * Create the HTTPS server and a web socket on the same port
 */
const server = https.createServer(httpsOptions, app);
const wss = new WebSocketServer({
    server,
    path: '/reload'
});

/*
 * Add a reload endpoint that rollup builds call, which notifies the browser client to reload itself
 */
app.get('/reload', (request: Request, response: Response) => {

    console.log('Web socket server broadcasting reload event ...');
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    }
    response.sendStatus(204);
});

/*
 * Serve the static content
 */
const spaBasePath = '/spa/';
const spaPhysicalRoot = 'dist';
app.use(spaBasePath, express.static(spaPhysicalRoot));
app.get('*_', handleNotFoundPath);

/*
 * Start listening
 */
server.listen(configuration.port, () => {
    console.log(`Web host is listening on HTTPS port ${configuration.port} ...`);
});

/*
 * Use a strong content security policy for development
 */
function setSecurityHeaders(request: Request, response: Response, next: NextFunction): any {

    let policy = "default-src 'none';";
    policy += " script-src 'self';";
    policy += ` connect-src 'self' ${configuration.trustedHosts.join(' ')};`;
    policy += " child-src 'self';";
    policy += " img-src 'self';";
    policy += " style-src 'self';";
    policy += " object-src 'none';";
    policy += " frame-ancestors 'none';";
    policy += " base-uri 'self';";
    policy += " form-action 'self'";

    response.setHeader('content-security-policy', policy);
    response.setHeader('strict-transport-security', 'max-age=31536000; includeSubdomains; preload');
    response.setHeader('x-frame-options', 'DENY');
    response.setHeader('x-xss-protection', '1; mode=block');
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('referrer-policy', 'same-origin');
    next();
}

/*
 * Handle paths that don't map to physical resources
 */
function handleNotFoundPath(request: Request, response: Response) {

    const requestPath = request.path.toLowerCase();
    if (requestPath === '/favicon.ico') {

        // Serve the root level favicon.ico file
        const rootPhysicalPath = './';
        response.sendFile('favicon.ico', {root: rootPhysicalPath});

    } else if (requestPath.startsWith(spaBasePath)) {

        // Within the SPA serve the default document
        response.sendFile('index.html', {root: spaPhysicalRoot});

    } else {

        // For other paths, redirect to the SPA
        response.redirect(spaBasePath);
    }
}
