import {Context} from 'aws-lambda';

/*
 * This lambda runs during requests to the origin, to set the default document
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const handler: any = async (event: any, context: Context) => {

    // Get the request path
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();

    // For performance and to reduce error handling scope we hard code application root paths here
    const applicationRootPaths = [
        'spa',
        'spa2',
    ];
    const extensions = [
        '.html',
        '.json',
        '.js',
        '.css',
        '.svg',
    ];

    // See if the user has browsed to a location within one of the above root paths
    const foundRootPath = applicationRootPaths.find((path) => {
        return requestUri.startsWith(`/${path}`);
    });

    if (foundRootPath) {

        // See if this is a known extension
        const knownExtension = extensions.find((ext) => {
            return requestUri.endsWith(`${ext}`);
        });

        // If not then serve the root document
        if (!knownExtension) {
            request.uri = `/${foundRootPath}/index.html`;
        }
    } else {

        // Otherwise serve the index document for the first root path
        request.uri = `/${applicationRootPaths[0]}/index.html`;

    }

    return request;
};

// Export the handler to serverless.yml
export {handler};
