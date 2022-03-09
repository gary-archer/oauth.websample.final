import {Response} from 'express';
import {SecurityHeaderConfiguration} from './configuration/securityHeaderConfiguration';

/*
 * A simple class to manage writing security headers and the Content Security Policy
 */
export class SecurityHeaders {

    private readonly _configuration: SecurityHeaderConfiguration;

    public constructor(configuration: SecurityHeaderConfiguration) {
        this._configuration = configuration;
    }

    /*
     * Add standard security headers to the response to improve default browser secuirty
     */
    public write(response: Response): void {

        // Only allow Ajax calls from the browser to our API domain, and code to execute from our web origin
        const trustedHosts = this._configuration.trustedHosts.join(' ');
        let policy = "default-src 'none';";
        policy += " script-src 'self';";
        policy += ` connect-src 'self' ${trustedHosts};`;
        policy += " child-src 'self';";
        policy += " img-src 'self';";
        policy += " style-src 'self';";
        policy += " object-src 'none'";

        // Add the headers
        response.setHeader('content-security-policy', policy);
        response.setHeader('strict-transport-security', 'max-age=63072000; includeSubdomains; preload');
        response.setHeader('x-frame-options', 'DENY');
        response.setHeader('x-xss-protection', '1; mode=block');
        response.setHeader('x-content-type-options', 'nosniff');
        response.setHeader('referrer-policy', 'same-origin');
    }
}
