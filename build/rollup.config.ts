import _commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import _replace from '@rollup/plugin-replace';
import _terser from '@rollup/plugin-terser';
import _typescript from '@rollup/plugin-typescript';
import {randomUUID} from 'crypto';
import path from 'path';
import {defineConfig, RollupOptions} from 'rollup';
import _copy from 'rollup-plugin-copy';
import {copyConfiguration, copyOnEdit, notifyBrowser} from './plugins/developmentPlugins.js';
import {finalizeBundles, writeCssAndHtml} from './plugins/productionPlugins.js';

// Type updates to prevent Visual Studio Code intellisense warnings
// - https://github.com/rollup/plugins/issues/1662
const commonjs = _commonjs as unknown as typeof _commonjs.default;
const typescript = _typescript as unknown as typeof _typescript.default;
const replace = _replace as unknown as typeof _replace.default;
const copy = _copy as unknown as typeof _copy.default;
const terser = _terser as unknown as typeof _terser.default;

// Set base values and use the watch flag to distinguish between development v production builds
const isDevelopment = process.env.ROLLUP_WATCH === 'true';
const buildId = randomUUID().slice(0, 8);
const outputFolder = 'dist';

const options: RollupOptions = {

    input: 'src/index.tsx',
    output: {

        // Output ECMAScript modules
        dir: outputFolder,
        format: 'esm',

        // Define chunks names for the entry point app chunk, and any manual and dynamic chunks
        entryFileNames: isDevelopment ? 'app.bundle.js' : `app.${buildId}.bundle.js`,
        chunkFileNames: isDevelopment ? '[name].bundle.js' : `[name].${buildId}.bundle.js`,

        // Define content for chunks referenced in index.html
        manualChunks: (id: string) => {

            if (!id.includes('node_modules')) {
                return null;
            }

            if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
                return 'react';
            }

            return 'vendor';
        },

        // Enable source maps and us correct paths to support SPA debugging
        sourcemap: true,
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            return path.resolve(path.dirname(sourcemapPath), relativeSourcePath);
        },
    },

    watch: {
        clearScreen: false,
    },

    onwarn(warning, warn) {

        // Ignore this React warning
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
            return;
        }

        warn(warning);
    },

    plugins: [

        // Use browser resolution for node_modules
        nodeResolve({
            browser: true,
        }),

        // Convert any commonjs libraries from the node_modules folder to ECMAScript
        commonjs(),

        // Use tslib and the typescript plugin with the settings from the tsconfig.json file
        typescript(),

        // React requires the NODE_ENV value and we add IS_DEBUG to determine whether to render exception stack traces
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'IS_DEBUG': JSON.stringify(isDevelopment),
            preventAssignment: true,
        }),

        // Copy these static files to the output folder when a build completes
        copy({
            targets: [
                { src: 'favicon.ico', dest: outputFolder },
                { src: 'index.html', dest: outputFolder },
            ],
        }),

        isDevelopment ? [

            // In development, copy CSS files directly to the output folder when a build completes
            copy({
                targets: [
                    { src: 'css/*', dest: outputFolder },
                ],
            }),

            // Add development plugins to copy non JavaScript files and to notify the browser
            copyConfiguration(),
            copyOnEdit(),
            notifyBrowser(),

        ] : [

            // For production builds, adjust bundle output and write the final CSS and HTML
            terser(),
            finalizeBundles(),
            writeCssAndHtml(buildId, outputFolder),
        ]
    ],
};

export default defineConfig(options);
