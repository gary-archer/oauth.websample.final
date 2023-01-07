
import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.mjs';

export default merge(baseConfig, {

  // Let webpack know this is a development build
  mode: 'development',

  // Output source maps to enable debugging of browser code
  devtool: 'source-map',

  // Pass a variable through to our Web UI to tell it to display stack traces
  plugins:[
    new webpack.DefinePlugin({
      SHOW_STACK_TRACE: 'true',
    })
  ]
});