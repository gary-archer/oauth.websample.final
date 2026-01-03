import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';
import webpack from 'webpack';

const dirname = process.cwd();
const config: webpack.Configuration = {

    // Set the working folder and build bundles for the browser
    context: path.resolve(dirname, '.'),
    target: ['web'],

    // Always output a source map, to support stack trace lookups
    devtool: 'source-map',

    entry: {

        // Specify the application entry point
        app: './src/index.tsx',
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
        chunkFilename: '[name].bundle.js',
        module: true,
    },
    experiments: {
        outputModule: true,
    },
    optimization: {

        splitChunks: {
            cacheGroups: {
                react: {
                    name: 'react',
                    chunks: 'all',
                    enforce: true,
                    test: (module: any) => {

                        const includeChunk = (resource: string) => {
                            return resource.indexOf('node_modules') !== -1 &&
                                   resource.indexOf('react') !== -1;
                        };

                        return module.resource && includeChunk(module.resource);
                    },
                },
                vendor: {
                    name: 'vendor',
                    chunks: 'all',
                    enforce: true,
                    test: (module: any) => {

                        const includeChunk = (resource: string) => {
                            return resource.indexOf('node_modules') !== -1 &&
                                   resource.indexOf('react') === -1;
                        };

                        return module.resource && includeChunk(module.resource);
                    },
                }
            }
        },
    },
    plugins: [

        // Copy static files to the dist folder
        new CopyPlugin({
            patterns: [
                {
                    from: 'index.html',
                    to: path.resolve('../dist/spa'),
                },
                {
                    from: 'css',
                    to: path.resolve('../dist/spa'),
                },
                {
                    from: '../favicon.ico',
                    to: path.resolve('../dist'),
                },
            ]
        }),
    ]
};

export default config;
