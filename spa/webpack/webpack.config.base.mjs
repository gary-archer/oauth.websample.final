import path from 'path';

const dirname = process.cwd();
export default {
  
  // Set the working folder and build bundles for the browser
  context: path.resolve(dirname, './src'),
  target: ['web'],

  // Always output source maps for SPAs
  devtool: 'source-map',

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

    // Output our Javascript bundles to a dist folder
    path: path.resolve(dirname, './dist'),
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
