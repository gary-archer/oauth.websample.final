const webpack = require('webpack');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');
const rewriteIndexHtml = require('./rewriteIndexHtml.js');

module.exports = merge(baseConfig, {

  // Let webpack know this is a production build
  mode: 'production',

  // Turn off performance warnings for our sample
  performance: {
    hints: false
  },

  // Output source maps to enable production debugging of browser code
  devtool: 'source-map',

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
