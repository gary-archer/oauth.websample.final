import _commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import _replace from '@rollup/plugin-replace';
import _terser from '@rollup/plugin-terser';
import {randomUUID} from 'crypto';
import path from 'path';
import {defineConfig, RollupOptions} from 'rollup';
import _copy from 'rollup-plugin-copy';
import esbuild from 'rollup-plugin-esbuild';
import {copyConfiguration, copyOnEdit, notifyBrowser} from './plugins/developmentPlugins.js';
import {finalizeBundles, writeCssAndHtml} from './plugins/productionPlugins.js';

// Type updates to prevent Visual Studio Code intellisense warnings
// - https://github.com/rollup/plugins/issues/1662
const commonjs = _commonjs as unknown as typeof _commonjs.default;
const copy = _copy as unknown as typeof _copy.default;
const replace = _replace as unknown as typeof _replace.default;
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

        // Define chunks names for the entry point app chunk, and any initial chunks referenced in index.html
        entryFileNames: isDevelopment ? 'app.bundle.js' : `app.${buildId}.bundle.js`,
        chunkFileNames: isDevelopment ? '[name].bundle.js' : `[name].${buildId}.bundle.js`,
        manualChunks: (id: string) => {

            if (!id.includes('node_modules')) {
                return null;
            }

            if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
                return 'react';
            }

            return 'vendor';
        },

        // Enable source maps and us correct paths to support debugging
        sourcemap: true,
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            return path.resolve(path.dirname(sourcemapPath), relativeSourcePath);
        },
    },

    watch: {
        clearScreen: false,
    },

    // Ignore this React warning
    onwarn(warning, warn) {

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

        // Use esbuild as an up to date plugin for building typescript code
        esbuild({
            tsconfig: './tsconfig.json',
            target: 'es2020',
        }),

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
