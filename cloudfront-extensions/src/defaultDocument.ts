import {Context} from 'aws-lambda';

/*
 * This lambda runs during requests to the origin, to set the default document
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const handler = async (event: any, context: Context) => {

    // Get the request path
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();

    // Handle the request for favicon.ico
    if (requestUri === '/favicon.ico') {
        return request;
    }

    // For invalid paths, redirect to the SPA
    const spaBasePath = '/spa/';
    if (!requestUri.startsWith(spaBasePath)) {

        return {
            status: '301',
            statusDescription: 'Moved Permanently',
            headers: {
                'location': [{
                  key: 'Location',
                  value: spaBasePath,
                }],
            },
        };
    }

    // Otherwise, serve files for known extensions
    const extensions = [
        '.html',
        '.js',,
        '.css'
    ];

    const knownExtension = extensions.find((ext) => {
        return requestUri.endsWith(`${ext}`);
    });

    if (knownExtension) {
        return request;
    }

    // Serve the SPA index.html for other requests within that path
    request.uri = `${spaBasePath}index.html`;
    return request;
};

// Export the handler to serverless.yml
export {handler};
