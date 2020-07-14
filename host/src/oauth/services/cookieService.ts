import {Request, Response} from 'express';
import {ClientError} from '../errors/clientError';
import {ErrorCodes} from '../errors/errorCodes';

/*
 * Our cookie service class will deal with cookie handling during requests to the token endpoint
 */
export class CookieService {

    private readonly cookieName = 'basic-spa-auth';

    /*
     * Write a parent domain response cookie containing the refresh token
     */
    public write(refreshToken: string, response: Response): void {

        console.log('WRITING COOKIE');
        console.log('REFRESH TOKEN: ' + refreshToken);
        const options = {
            domain: '.mycompany.com',
            httpOnly: true,
            secure: true,
        };

        response.cookie(this.cookieName, refreshToken, options);
        console.log('WRITTEN COOKIE');
    }

    /*
     * Read the refresh token from the request cookie
     */
    public read(request: Request): string {

        if (request.cookies) {
            const refreshToken = request.cookies[this.cookieName];
            if (refreshToken) {
                return refreshToken;
            }
        }

        throw new ClientError(400, ErrorCodes.invalidGrant, 'The session is invalid or expired')
    }
}
