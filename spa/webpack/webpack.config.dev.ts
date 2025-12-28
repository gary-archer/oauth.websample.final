import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';
import webpackDevServer, {Request, Response, NextFunction} from 'webpack-dev-server';

/*
 * Use a strong content security policy for development
 */
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

/*
 * Configure the main development server
 */
const dirname = process.cwd();
const devServer: webpackDevServer.Configuration = {

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
        disableDotRule: true,
    },
    hot: true,
    allowedHosts: [
        'www.authsamples-dev.com',
    ],

    // Add recommended security headers during development
    headers: [
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
    ],
    setupMiddlewares: (middlewares: webpackDevServer.Middleware[]) => {

        // Redirect for paths outside the root, which React Router cannot serve when it uses a base path
        // - https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares
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
    },
};

const devConfig: webpack.Configuration = {

    // Let webpack know this is a development build
    mode: 'development',
    devServer,

    output: Object.assign({}, baseConfig.output, {

        // Enable stepping through the SPA's TypeScript code in the Visual Studio Code debugger
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',

        // Setting the public path here can prevents errors in development builds that use a CSP
        publicPath: '/spa/',
    }),

    // Pass a variable through to the frontend to tell it to display stack traces
    plugins:[
        new webpack.DefinePlugin({
            IS_DEBUG: 'true',
        })
    ]
};

export default merge(baseConfig, devConfig);
