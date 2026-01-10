import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';
import {getDevelopmentServer} from './developmentServer.js';

/*
 * Return the development configuration
 */
const devConfig: webpack.Configuration = {

    // Let webpack know this is a development build
    mode: 'development',
    devServer: getDevelopmentServer(),

    output: {

        // Use unminimized file names
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',

        // Enable stepping through the SPA's TypeScript code in the Visual Studio Code debugger
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',

        // Setting the public path here can prevent errors in development builds that use a CSP
        publicPath: '/spa/',
    },

    // Pass a variable through to the frontend to tell it to display stack traces
    plugins:[
        new webpack.DefinePlugin({
            IS_DEBUG: 'true',
        })
    ]
};

export default merge(baseConfig, devConfig);
