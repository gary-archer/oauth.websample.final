
import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';

const devConfig: webpack.Configuration = {

    // Let webpack know this is a development build
    mode: 'development',

    // Pass a variable through to our Web UI to tell it to display stack traces
    plugins:[
        new webpack.DefinePlugin({
            SHOW_STACK_TRACE: 'true',
        })
    ]
};

export default merge(baseConfig, devConfig);
