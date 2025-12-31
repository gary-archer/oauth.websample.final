import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';

const prodConfig: webpack.Configuration = {

    // Let webpack know this is a production build
    mode: 'production',

    // Turn off performance warnings that I do not want to deal with for the demo SPA
    performance: {
        hints: false,
    },

    plugins:[

        // Pass a variable through to our Web UI to tell it to not display stack traces
        new webpack.DefinePlugin({
            IS_DEBUG: 'false',
        })
    ]
};

export default merge(baseConfig, prodConfig);
