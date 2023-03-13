import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';
import {rewriteIndexHtml} from './rewriteIndexHtml.js';

const prodConfig: webpack.Configuration = {

    // Let webpack know this is a production build
    mode: 'production',

    // Turn off performance warnings about bundle sizes
    performance: {
        hints: false
    },

    plugins:[
        {
            // In release builds, write the final index.html
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
                    rewriteIndexHtml();
                });
            }
        },

        // Pass a variable through to our Web UI to tell it to display stack traces
        new webpack.DefinePlugin({
            SHOW_STACK_TRACE: 'false',
        })
    ]
};

export default merge(baseConfig, prodConfig);
