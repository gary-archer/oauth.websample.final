import {Context} from 'aws-lambda';

/*
 * This lambda runs during requests to the origin, to set the default document
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const handler = async (event: any, context: Context) => {

    // Get the request path
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();

    // If we are in a path where the React app will fail, return a redirect to a valid path
    const basePath = '/spa/';
    if (!requestUri.startsWith(basePath)) {

        return {
            status: 302,
            statusDescription: 'Found',
            headers: {
                'location': [{
                    key: 'Location',
                    value: basePath,
                }],
            },  
        };
    }

    // See if this is a known extension
    const extensions = [
        '.html',
        '.js',
        '.css',
    ];
    const knownExtension = extensions.find((ext) => {
        return requestUri.endsWith(`${ext}`);
    });
    
    // If not, serve the index.html file
    if (!knownExtension) {
        request.uri = `${basePath}index.html`;
    }

    // Otherwise serve the resource requested
    return request;
};

// Export the handler to serverless.yml
export {handler};
