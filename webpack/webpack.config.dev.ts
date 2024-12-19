
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';
import webpackDevServer, {Request, Response, NextFunction} from 'webpack-dev-server';

/*
 * Configure the main development server
 */
const dirname = process.cwd();
const devServer: webpackDevServer.Configuration = {

    // Use HTTPS for local development
    server: {
        type: 'https',
        options: {
            key: fs.readFileSync('./certs/authsamples-dev.ssl.key'),
            cert: fs.readFileSync('./certs/authsamples-dev.ssl.crt'),
        },
    },
    static: {
        directory: path.join(dirname, './dist'),
    },
    port: 443,
    historyApiFallback: {
        // Serve the index.html file for this subfolder for not found routes like /spa/xxx
        index: '/spa/',
    },
    hot: true,
    allowedHosts: [
        'www.authsamples-dev.com',
    ],
    setupMiddlewares: (middlewares: webpackDevServer.Middleware[]) => {

        // Redirect for paths outside the root, which React Router cannot serve when it uses a base path
        // - https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares
        middlewares.unshift({
            name: 'first-in-array',
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

    // This setting enables us to step through our TypeScript in Visual Studio Code
    output: Object.assign({}, baseConfig.output, {
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',
        publicPath: '/spa/',
    }),

    // Pass a variable through to our Web UI to tell it to display stack traces
    plugins:[
        new webpack.DefinePlugin({
            IS_DEBUG: 'true',
        })
    ]
};

export default merge(baseConfig, devConfig);
