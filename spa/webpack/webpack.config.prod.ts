import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';

const prodConfig: webpack.Configuration = {

    // Let webpack know this is a production build
    mode: 'production',

    // Increase the default limit to avoid warnings
    performance: {
        maxEntrypointSize: 400000,
    },

    plugins:[

        // Pass a variable through to our Web UI to tell it to not display stack traces
        new webpack.DefinePlugin({
            IS_DEBUG: 'false',
        })
    ]
};

export default merge(baseConfig, prodConfig);
