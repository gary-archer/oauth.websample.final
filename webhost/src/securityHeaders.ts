import {Response} from 'express';
import {Configuration} from './configuration';

/*
 * A simple class to manage writing security headers and the Content Security Policy
 */
export class SecurityHeaders {

    private readonly _configuration: Configuration;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
    }

    /*
     * Add standard security headers to the response to improve default browser secuirty
     */
    public write(response: Response): void {

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
        response.setHeader('strict-transport-security', 'max-age=63072000; includeSubdomains; preload');
        response.setHeader('x-frame-options', 'DENY');
        response.setHeader('x-xss-protection', '1; mode=block');
        response.setHeader('x-content-type-options', 'nosniff');
        response.setHeader('referrer-policy', 'same-origin');
    }
}
