import path from 'path';
import webpack, {Module, NormalModule} from 'webpack';

const dirname = process.cwd();
const config: webpack.Configuration = {

    // Set the working folder and build bundles for the browser
    context: path.resolve(dirname, './src'),
    target: ['web'],

    // Always output a source map, to support stack trace lookups
    devtool: 'source-map',

    entry: {

        // Specify the application entry point
        app: ['./index.tsx'],
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

        // Output our Javascript bundles to the ../dist/spa folder
        path: path.resolve(dirname, '../dist/spa'),
        filename: '[name].bundle.js',
        module: true,
    },
    experiments: {
        outputModule: true,
    },
    optimization: {

        // Build third party code into two bundles, for React and non-React code
        // Using a function works for both the webpack dev server and release builds
        splitChunks: {
            cacheGroups: {
                react: {
                    name: 'react',
                    chunks: 'all',
                    test: (module: Module) => {

                        if (!(module instanceof NormalModule)) {
                            return false;
                        }

                        if (module.resource.indexOf('node_modules') !== -1 && module.resource.indexOf('react') !== -1) {
                            return true;
                        }

                        return false;
                    },
                },
                vendor: {
                    name: 'vendor',
                    chunks: 'all',
                    test: (module: Module) => {

                        if (!(module instanceof NormalModule)) {
                            return false;
                        }

                        if (module.resource.indexOf('node_modules') !== -1 && module.resource.indexOf('react') === -1) {
                            return true;
                        }

                        return false;
                    },
                }
            }
        }
    }
};

export default config;
