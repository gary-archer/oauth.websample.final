import {LambdaEdgeRequest} from '../edge/lambdaEdgeRequest';
import {LambdaEdgeResponse} from '../edge/lambdaEdgeResponse';

/*
 * An abstraction for getting non deterministic data, including responses from the Authorization Server
 */
export interface ProxyService {

    // Forward the authorization code grant to the Authorization Server to complete a login
    sendAuthorizationCodeGrant(request: LambdaEdgeRequest, response: LambdaEdgeResponse): Promise<any>;

    // Forward the refresh token grant to the Authorization Server to get a new access token
    sendRefreshTokenGrant(refreshToken: string, request: LambdaEdgeRequest, response: LambdaEdgeResponse): Promise<any>;

    // Generate a value to protect the cookie
    generateCsrfField(): string;
}
