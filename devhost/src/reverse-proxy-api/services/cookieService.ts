import {CookieOptions, Request, Response} from 'express';
import {ClientError} from '../errors/clientError';

/*
 * Our cookie service class will deal with cookie handling during requests to the token endpoint
 */
export class CookieService {

    private readonly cookieName = 'mycompany-auth';

    /*
     * Write a parent domain response cookie containing the refresh token
     */
    public write(clientId: string, refreshToken: string, response: Response): void {

        const options = {
            httpOnly: true,
            secure: true,
            path: '/reverse-proxy',
        };

        response.cookie(`${this.cookieName}-${clientId}`, refreshToken, options as CookieOptions);
    }

    /*
     * Read the refresh token from the request cookie
     */
    public read(clientId: string, request: Request): string {

        if (request.cookies) {
            const refreshToken = request.cookies[`${this.cookieName}-${clientId}`];
            if (refreshToken) {
                return refreshToken;
            }
        }

        throw ClientError.invalidGrant('No auth cookie was found in the incoming request');
    }

    /*
     * Cause an invalid_grant error when the refresh token is next sent to the Authorization Server
     */
    public expire(clientId: string, refreshToken: string, request: Request, response: Response): void {

        const expiredRefreshToken = `x${refreshToken}x`;
        this.write(clientId, expiredRefreshToken, response);
    }
}
