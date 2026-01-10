import CopyPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import path from 'path';
import {PurgeCSS} from 'purgecss';
import webpack, {Compiler} from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';
import{writeProductionAssets} from './writeProductionAssets.js';

/*
 * Return the production configuration
 */
const timestamp = new Date().getTime().toString();
const prodConfig: webpack.Configuration = {

    // Let webpack know this is a production build
    mode: 'production',

    // Increase the default limit to avoid warnings
    performance: {
        maxEntrypointSize: 400000,
    },

    output: {

        // Each webpack production build has a distinct hash that production builds use as a cache busting timestamp
        // When bundle files reference each other, use the hash to prevent the browser getting old cached bundles
        filename: `[name].bundle.min.js?t=${timestamp}`,
        chunkFilename: `[name].bundle.min.js?t=${timestamp}`,
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
                    from: 'css/app.css',
                    to: path.resolve('../dist/spa/app.min.css'),
                },
                {
                    from: '../favicon.ico',
                    to: path.resolve('../dist'),
                },
            ]
        }),

        {
            apply: (compiler: Compiler) => {
                compiler.hooks.afterEmit.tap('AfterEmitPlugin', async () => {

                    // Minify CSS and use a safelist to prevent required elements being removed
                    // - https://github.com/FullHuman/purgecss/issues/491
                    const result = await new PurgeCSS().purge({
                        css: ['css/bootstrap.css'],
                        content: ['../dist/spa/app.bundle.min.js'],
                        safelist: ['body', 'container'],
                    });
                    fs.writeFileSync('../dist/spa/bootstrap.min.css', result[0].css);

                    // Produce the final HTML assets for production builds
                    writeProductionAssets(timestamp);
                });
            }
        },

        // Pass a variable through to our Web UI to tell it to not display stack traces
        new webpack.DefinePlugin({
            IS_DEBUG: 'false',
        })
    ],
};

export default merge(baseConfig, prodConfig);
