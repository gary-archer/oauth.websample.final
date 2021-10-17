var WebpackObfuscator = require('webpack-obfuscator');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {

  // Let webpack know this is a production build
  mode: 'production',

  // Turn off performance warnings for our sample
  performance: {
    hints: false
  },

  plugins:[
    
    // Pass a variable through to our Web UI to tell it to not display stack traces
    new webpack.DefinePlugin({
      SHOW_STACK_TRACE: 'false',
    }),

    // Obfuscate our app's production code but not vendor code
    new WebpackObfuscator ({
      rotateStringArray: true
    }, ['vendor.bundle.js'])
  ]
});