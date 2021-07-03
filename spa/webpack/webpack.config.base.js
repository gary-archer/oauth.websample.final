const path = require('path');

module.exports = {
  
  // Set the working folder
  context: path.resolve(__dirname, '../src'),

  // The sample runs in the big four modern desktop browsers and the two main mobile browsers
  target: ['web', 'es2017'],

  entry: {

    // Specify the application entry point
    app: ['./index.tsx']
  },
  module: {
    rules: [
      {
        // Files with a .ts or .tsx extension are loaded by the Typescript loader
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    
    // Set extensions for import statements, and the .js extension allows us to import modules from JS libraries
    extensions: ['.ts', '.tsx', '.js']
  },
  output: {

    // This tells web workers where to load from
    publicPath: 'dist/',
    
    // Output our Javascript bundles to a dist folder
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js'
  },
  optimization: {

    // Indicate that third party code is built to a separate vendor bundle file
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: /node_modules/,
          enforce: true
        },
      }
    }
  }
}
