import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';

const prodConfig: webpack.Configuration = {

    // Let webpack know this is a production build
    mode: 'production',

    // Turn off inaccurate performance warnings
    performance: {
        hints: false,
    },

    plugins:[

        // Pass a variable through to our Web UI to tell it to not display stack traces
        new webpack.DefinePlugin({
            SHOW_STACK_TRACE: 'false',
        })
    ]
};

export default merge(baseConfig, prodConfig);
