import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.mjs';
import {rewriteIndexHtml} from './rewriteIndexHtml.mjs'

export default merge(baseConfig, {

  // Let webpack know this is a production build
  mode: 'production',

  // Turn off performance warnings for our sample
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
    
    // Pass a variable through to our Web UI to tell it to not display stack traces
    new webpack.DefinePlugin({
      SHOW_STACK_TRACE: 'false',
    })
  ]
});
