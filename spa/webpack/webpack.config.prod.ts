import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';

/*
 * Return the production configuration
 */
const prodConfig: webpack.Configuration = {

    // Let webpack know this is a production build
    mode: 'production',

    // Increase the default limit to avoid warnings
    performance: {
        maxEntrypointSize: 400000,
    },

    output: {

        // Each webpack production build has a distinct hash that production builds use as a cache busting timestamp
        // When bundle files reference each other, use the hash to prevent the browser getting old cached bundles
        filename: '[name].bundle.js?t=[fullhash]',
        chunkFilename: '[name].bundle.js?t=[fullhash]',
    },

    plugins:[

        // Pass a variable through to our Web UI to tell it to not display stack traces
        new webpack.DefinePlugin({
            IS_DEBUG: 'false',
        })
    ]
};

export default merge(baseConfig, prodConfig);
