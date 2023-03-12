import path from 'path';
import webpack from 'webpack';

const dirname = process.cwd();
const config: webpack.Configuration = {

    // Set the working folder and build bundles for the browser
    context: path.resolve(dirname, './src'),
    target: ['web'],
    devtool: false,

    entry: {

        // Specify the application entry point
        app: ['./index.ts']
    },
    module: {
        rules: [{

            // Files with a .ts extension are loaded by the Typescript loader
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {

        // Set extensions for import statements
        extensions: ['.ts', '.js']
    },
    output: {

        // Output our Javascript bundles to a dist folder
        path: path.resolve(dirname, './dist'),
        filename: '[name].bundle.js'
    },
    optimization: {

        // Build third party code to a separate vendor bundle file
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
};

export default config;
