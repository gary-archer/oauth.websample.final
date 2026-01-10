import fs from 'fs';
import path from 'path';
import {Configuration, Headers, Middleware, Request, Response, NextFunction} from 'webpack-dev-server';

/*
 * Return the webpack development server details
 */
export function configureDevelopmentServer(): Configuration {

    const dirname = process.cwd();
    return {

        // Use HTTPS and a real world domain name for local development
        server: {
            type: 'https',
            options: {
                pfx: fs.readFileSync('../certs/authsamples-dev.ssl.p12'),
                passphrase: 'Password1',
            },
        },
        static: {
            directory: path.join(dirname, '../dist'),
        },
        port: 443,
        open: 'https://www.authsamples-dev.com/spa',

        // Output bundles to disk to enable viewing of the final ECMAScript code in bundle files
        devMiddleware: {
            writeToDisk: true,
        },

        // Serve the index.html file for this subfolder for not found routes like /spa/xxx
        historyApiFallback: {
            index: '/spa/',
        },
        hot: false,
        allowedHosts: [
            'www.authsamples-dev.com',
        ],

        // Add recommended security headers during development
        headers: getWebHostSecurityHeaders(),

        // Handle redirects for paths outside the root
        setupMiddlewares: getRedirectMiddleware,
    };
}

/*
 * During development, the web host sets a strong content security policy, and also some secondary security headers
 */
function getWebHostSecurityHeaders(): Headers {

    const bffHost = (process.env.LOCALAPI === 'true') ?
        'https://bfflocal.authsamples-dev.com:444' : 'https://bff.authsamples-dev.com';

    let policy = "default-src 'none';";
    policy += " script-src 'self';";
    policy += ` connect-src 'self' ${bffHost};`;
    policy += " child-src 'self';";
    policy += " img-src 'self';";
    policy += " style-src 'self';";
    policy += " object-src 'none';";
    policy += " frame-ancestors 'none';";
    policy += " base-uri 'self';";
    policy += " form-action 'self'";

    return [
        {
            key: 'content-security-policy',
            value: policy,
        },
        {
            key: 'strict-transport-security',
            value: 'max-age=31536000; includeSubdomains; preload',
        },
        {
            key: 'x-frame-options',
            value: 'DENY',
        },
        {
            key: 'x-xss-protection',
            value: '1; mode=block',
        },
        {
            key: 'x-content-type-options',
            value: 'nosniff',
        },
        {
            key: 'referrer-policy',
            value: 'same-origin',
        },
    ];
}

/*
 * In this example, React Router uses a base path of /spa and cannot serve other paths.
 * Therefore, redirect for unknown paths outside the root.
 * - https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares
 */
function getRedirectMiddleware(middlewares: Middleware[]): Middleware[] {

    middlewares.unshift({
        name: 'not-found',
        path: '/',
        middleware: (request: Request, response: Response, next: NextFunction) => {

            const currentPath = request.path.toLowerCase();
            if (currentPath.startsWith('/spa/') || currentPath === '/favicon.ico') {
                next();
                return;
            }

            response.redirect('/spa/');
        },
    });

    return middlewares;
}
