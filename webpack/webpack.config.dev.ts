
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';
import webpackDevServer from 'webpack-dev-server';

const dirname = process.cwd();
const devServer: webpackDevServer.Configuration = {
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
        index: '/spa/',
    },
    hot: true,
    allowedHosts: [
        'www.authsamples-dev.com',
    ],
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
