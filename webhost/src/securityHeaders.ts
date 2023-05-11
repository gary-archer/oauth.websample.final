import {NextFunction, Request, Response} from 'express';
import {Configuration} from './configuration.js';

/*
 * Add standard web security headers to the response to improve default browser security
 */
export class SecurityHeaders {

    private readonly _configuration: Configuration;

    public constructor(configuration: Configuration) {

        this._configuration = configuration;
        this._setupCallbacks();
    }

    /*
     * Add the headers including a content security policy
     */
    public add(request: Request, response: Response, next: NextFunction): any {

        // Prevent external sites being able to abuse the SPA's web origin
        const trustedHosts = this._configuration.trustedHosts.join(' ');
        let policy = "default-src 'none';";
        policy += " script-src 'self';";
        policy += ` connect-src 'self' ${trustedHosts};`;
        policy += " child-src 'self';";
        policy += " img-src 'self';";
        policy += " style-src 'self';";
        policy += " object-src 'none';";
        policy += " frame-ancestors 'none';";
        policy += " base-uri 'self';";
        policy += " form-action 'self'";

        // Add standard headers, including the content security policy
        response.setHeader('content-security-policy', policy);
        response.setHeader('strict-transport-security', 'max-age=31536000; includeSubdomains; preload');
        response.setHeader('x-frame-options', 'DENY');
        response.setHeader('x-xss-protection', '1; mode=block');
        response.setHeader('x-content-type-options', 'nosniff');
        response.setHeader('referrer-policy', 'same-origin');

        // Ensure that resources other than the index.html file are served from the browser cache
        if (this._configuration.mode === 'deployed') {
            response.setHeader('cache-control', 'public, max-age: 31536000');
        }

        next();
    }

    private _setupCallbacks(): void {
        this.add = this.add.bind(this);
    }
}
