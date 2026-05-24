import connectLivereload from 'connect-livereload';
import express, {NextFunction, Request, Response} from 'express';
import fs from 'fs/promises';
import https from 'https';
import livereload from 'livereload';

/*
 * First load configuration
 */
interface Configuration {
    port: number;
    sslCertificateFileName: string;
    sslCertificatePassword: string;
    trustedHosts: string[];
    liveReloadHost: string;
}

const configurationJson = await fs.readFile('tools/webhost.config.json', 'utf-8');
const configuration =  JSON.parse(configurationJson) as Configuration;

/*
 * Create the Express host and develop with a strong content security policy
 */
const app = express();
app.use('/*_', setSecurityHeaders);

/*
 * I develop with SSL, so load the certificate file from disk
 */
const pfxData = await fs.readFile(configuration.sslCertificateFileName);
const httpsOptions = {
    pfx: pfxData,
    passphrase: configuration.sslCertificatePassword,
};

/*
 * During development, integrate live reload on port 35729
 */
const liveReloadServer = livereload.createServer({
    host: 'www.authsamples-dev.com',
    https: httpsOptions,
    mindelay: 250,
});
liveReloadServer.watch('dist');
app.use(connectLivereload());

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
const server = https.createServer(httpsOptions, app);
server.listen(configuration.port, () => {
    console.log(`Web host is listening on HTTPS port ${configuration.port}`);
});

/*
 * Use a strong content security policy for development
 */
function setSecurityHeaders(request: Request, response: Response, next: NextFunction): any {

    const trustedHosts = configuration.trustedHosts.join(' ');
    let policy = "default-src 'none';";
    policy += ` script-src 'self' ${configuration.liveReloadHost};`;
    policy += ` connect-src 'self' ${trustedHosts};`;
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

        // Within the SPA serve the defeault document
        response.sendFile('index.html', {root: spaPhysicalRoot});

    } else {

        // For other paths, redirect to the SPA
        response.redirect(spaBasePath);
    }
}