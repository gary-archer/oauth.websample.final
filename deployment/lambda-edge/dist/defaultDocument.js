"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
/*
 * This lambda runs during requests to the origin, to set the default document
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const handler = async (event, context) => {
    // Get the request path
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();
    // For performance and to reduce error handling scope we hard code application root paths here
    const applicationRootPaths = [
        'spa',
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
    }
    else {
        // Otherwise serve the index document for the first root path
        request.uri = `/${applicationRootPaths[0]}/index.html`;
    }
    return request;
};
exports.handler = handler;
