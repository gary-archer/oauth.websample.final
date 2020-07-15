import {NextFunction, Request, Response} from 'express';
import {Configuration} from '../configuration/configuration';
import {ErrorHandler} from '../errors/errorHandler';
import {ResponseWriter} from '../utilities/responseWriter';
import {AuthService} from '../services/authService';

/*
 * A class to route API requests to business logic classes
 */
export class ApiRouter {

    private readonly _authService: AuthService;

    public constructor(configuration: Configuration) {
        this._authService = new AuthService(configuration);
        this._setupCallbacks();
    }

    /*
     * The entry point for requests to the token endpoint
     */
    public async tokenEndpoint(request: Request, response: Response, next: NextFunction): Promise<void> {

        if (request.body && request.body.grant_type) {

            // Route the request to the Authorization Server, then store the refresh token in a cookie
            if (request.body.grant_type === 'authorization_code') {

                await this._authService.authorizationCodeGrant(request, response);
                return;
            }

            // Read the refresh token, then attach it to the request to the Authorization Server
            if (request.body.grant_type === 'refresh_token') {

                await this._authService.refreshTokenGrant(request, response);
                return;
            }
        }

        // Other grants are not supported
        throw ErrorHandler.fromRequestNotFound('A token endpoint request was received without a valid grant type');
    }

    /*
     * Do the work of making a refresh token act expired
     */
    public async expireRefreshToken(request: Request, response: Response, next: NextFunction): Promise<void> {

        await this._authService.expireRefreshToken(request, response);
    }

    /*
     * Handle requests to routes that do not exist
     */
    public notFoundHandler(request: Request, response: Response, next: NextFunction): void {

        // Handle the error to ensure it is logged
        const clientError = ErrorHandler.fromRequestNotFound();
        ErrorHandler.handleError(clientError);

        // Return an error to the client
        ResponseWriter.writeObjectResponse(response, clientError.statusCode, clientError.toResponseFormat());
    }

    /*
     * The entry point for handling exceptions forwards all exceptions to our handler class
     */
    public unhandledExceptionHandler(unhandledException: any, request: Request, response: Response): void {

        // Handle the error to ensure it is logged
        const clientError = ErrorHandler.handleError(unhandledException);

        // Return an error to the client
        ResponseWriter.writeObjectResponse(response, clientError.statusCode, clientError.toResponseFormat());
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.tokenEndpoint = this.tokenEndpoint.bind(this);
        this.expireRefreshToken = this.expireRefreshToken.bind(this);
        this.notFoundHandler = this.notFoundHandler.bind(this);
        this.unhandledExceptionHandler = this.unhandledExceptionHandler.bind(this);
    }
}
