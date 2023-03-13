import {Context} from 'aws-lambda';

/*
 * This lambda runs during requests to the origin, to set the default document
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const handler = async (event: any, context: Context) => {

    // Get the request path
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();

    // First serve files for known extensions
    const extensions = [
        '.html',
        '.js',
        '.css',
        '.ico',
    ];

    const knownExtension = extensions.find((ext) => {
        return requestUri.endsWith(`${ext}`);
    });

    if (knownExtension) {
        return request;
    }

    const demoAppBasePath = '/demoapp/';
    if (requestUri.startsWith(demoAppBasePath)) {
        
        // Serve the demoapp index.html for other requests within that path
        request.uri = `${demoAppBasePath}index.html`;
        return request;

    } else {

        // Serve the shellapp index.html for any other requests
        request.uri = '/index.html';
        return request;
    };
};

// Export the handler to serverless.yml
export {handler};
