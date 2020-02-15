
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {

  // Let webpack know this is a development build
  mode: 'development',

  // Output source maps to enable debugging of browser code
  devtool: "source-map",

  // Pass a variable through to our Web UI to tell it to display stack traces
  plugins:[
    new webpack.DefinePlugin({
      SHOW_STACK_TRACE: 'true',
    })
  ]
});