/*
 * This lambda runs during requests to the origin, to set the default document
 */
const handler = async (event: any) => {

    // Get the request path
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();

    // For performance and to reduce error handling scope we hard code application root paths here
    const applicationRootPaths = [
        'spa',
    ];

    // See if the user has browsed to /spa or /spa/
    const found = applicationRootPaths.find((path) => {
        return requestUri === `/${path}` || requestUri === `/${path}/`;
    });

    // If so then return index.html to prevent a CloudFront access denied error
    if (found) {
        request.uri = `/${found}/index.html`;
    }

    return request;
};

// Export the handler to serverless.yml
export {handler};
