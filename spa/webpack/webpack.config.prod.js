const webpack = require('webpack');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {

  // Let webpack know this is a production build
  mode: 'production',

  // Turn off performance warnings until we have a plan for dealing with them
  performance: {
    hints: false
  },

  // Pass a variable through to our Web UI to tell it to not display stack traces
  plugins:[
    new webpack.DefinePlugin({
      SHOW_STACK_TRACE: 'false',
    })
  ]
});