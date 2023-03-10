import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';
import {rewriteIndexHtml} from './rewriteIndexHtml.js';

const prodConfig: webpack.Configuration = {

    // Let webpack know this is a production build
    mode: 'production',

    plugins:[
        {
            // In release builds, write the final index.html
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
                    rewriteIndexHtml();
                });
            }
        }
    ]
};

export default merge(baseConfig, prodConfig);
