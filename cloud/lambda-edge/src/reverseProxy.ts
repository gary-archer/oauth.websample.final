import {Context} from 'aws-lambda';
import {ConfigurationLoader} from './configuration/configurationLoader';
import {LambdaEdgeRequest} from './reverse-proxy/edge/lambdaEdgeRequest';
import {LambdaEdgeResponse} from './reverse-proxy/edge/lambdaEdgeResponse';
import {ErrorHandler} from './reverse-proxy/errors/errorHandler';
import {Router} from './reverse-proxy/routing/router';

/*
 * The lambda runs at the deployed edge location for every single web request
 */
const handler = async (event: any, context: Context) => {

    // For normal web content delivery requests, return immediately
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();
    if (!requestUri.startsWith('/reverse-proxy/')) {
        return request;
    }

    // Wrap the request and response objects
    const edgeRequest = new LambdaEdgeRequest(request);
    const edgeResponse = new LambdaEdgeResponse();

    try {

        // Load configuration
        const configuration = await ConfigurationLoader.load();

        // Route the operation to update the response
        const router = new Router(configuration);
        await router.route(edgeRequest, edgeResponse);

    } catch (e) {

        // Handle errors
        const error = ErrorHandler.handleError(e);
        edgeResponse.setError(error);
    }

    return edgeResponse.toLambdaEdgeFormat();
};

// Export the handler to serverless.yml
export {handler};
