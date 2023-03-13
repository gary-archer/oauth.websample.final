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

    // If within the demoapp micro-UI, return its index.html
    const demoAppBasePath = '/demoapp/';
    if (requestUri.startsWith(demoAppBasePath)) {
        
        request.uri = `${demoAppBasePath}index.html`;
        return request;
    }

    // For these special routes, return the index.html for the shell app
    if (requestUri === '/login' ||
        requestUri === '/login' ||
        requestUri === '/loggedout') {

        request.uri = '/index.html';
        return request;
    }

    // For any other invalid path, redirect to the default micro-UI
    return {
        status: 302,
        statusDescription: 'Found',
        headers: {
            'location': [{
                key: 'Location',
                value: demoAppBasePath,
            }],
        },  
    };
};

// Export the handler to serverless.yml
export {handler};
