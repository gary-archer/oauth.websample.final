import {Context} from 'aws-lambda';

/*
 * This lambda runs during requests to the origin, to set the default document
 */
const handler = async (event: any, context: Context) => {

    // Get the request path
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();

    // If required, return the default document
    if (requestUri === '/spa' || requestUri === '/spa/') {
        request.uri = '/spa/index.html';
    }

    return request;
};

// Export the handler to serverless.yml
export {handler};
