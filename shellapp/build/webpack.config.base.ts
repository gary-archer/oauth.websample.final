import path from 'path';
import webpack from 'webpack';

const dirname = process.cwd();
const config: webpack.Configuration = {

    // Set the working folder and build bundles for the browser
    context: path.resolve(dirname, './src'),
    target: ['web'],

    // Always output a source map, to support stack trace lookups
    devtool: 'source-map',

    entry: {

        // Specify the application entry point
        app: ['./index.tsx']
    },
    module: {
        rules: [{

            // Files with a .ts or .tsx extension are loaded by the Typescript loader
            test: /\.(ts|tsx)$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {

        // Set extensions for import statements, where .js is used for importing modules from external libraries
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {

        // Output our Javascript bundles to a dist folder
        path: path.resolve(dirname, './dist'),
        filename: '[name].bundle.js'
    },
    plugins:[

        // Reduce the size of the moment library
        new webpack.IgnorePlugin({
            contextRegExp: /moment$/,
            resourceRegExp: /^\.\/locale$/,
        }),
    ],
    optimization: {

        // Build third party code into two bundles, for React and non-React code
        splitChunks: {
            cacheGroups: {
                react: {
                    chunks: 'all',
                    name: 'react',
                    test: /node_modules[\\/](react|react-dom|react-router-dom|react-modal)[\\/]/,
                },
                vendor: {
                    chunks: 'all',
                    name: 'vendor',
                    test: /node_modules/,
                }
            }
        }
    }
};

export default config;
