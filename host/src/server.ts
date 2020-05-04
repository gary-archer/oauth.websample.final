/*
 * A simple script to host our SPA locally and connect to AWS Cognito and an AWS hosted API
 */

import * as express from 'express';
import * as fs from 'fs-extra';
import * as https from 'https';
import {WebStaticContent} from './webStaticContent';

// Read the config file
const configBuffer = fs.readFileSync('../spa/spa.config.json');
const spaConfig = JSON.parse(configBuffer.toString());

// Override to the web development domain
spaConfig.oauth.appUri = 'https://web.mycompany.com/spa/';
const port = 443;

// Configure how web static content is served
const expressApp = express();
const content = new WebStaticContent(expressApp, spaConfig);
content.configure();

// Load SSL details
const sslCertificateFileName = './certs/mycompany.ssl.pfx';
const sslCertificatePassword = 'SslPassword1';

// Load the certificate file from disk
const sslOptions = {
    pfx: fs.readFileSync(sslCertificateFileName),
    passphrase: sslCertificatePassword,
};

// Start listening on HTTPS
const httpsServer = https.createServer(sslOptions, expressApp);
httpsServer.listen(port, () => {
    console.log(`Server is listening on HTTPS port ${port}`);
});
