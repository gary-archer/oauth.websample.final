import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import {defineConfig, RollupOptions} from 'rollup';
import copy from 'rollup-plugin-copy';
import {copyOnEdit, openBrowser} from './plugins/developmentPlugins';
import {finalizeBundles, renderBundles, writeCssAndHtml} from './plugins/productionPlugins';

const env = process.env.ROLLUP_WATCH === 'true' ? 'development' : 'production';
const outputFolder = 'dist';
const timestamp = new Date().getTime().toString();

const options: RollupOptions = {

    input: 'src/index.tsx',
    output: {

        // Output ECMAScript modules
        dir: outputFolder,
        format: 'esm',

        // Define name formats for the entry point app chunk, and any manual and dynamic chunks
        entryFileNames: 'app.bundle.js',
        chunkFileNames: '[name].bundle.js',

        // Define content for manual chunks, which are referenced in index.html
        manualChunks: (id: string) => {

            if (!id.includes('node_modules')) {
                return null;
            }

            if (id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/react-router/') ||
                id.includes('node_modules/scheduler/')) {

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

        // Use tslib and the typescript plugin with the settings from the tsconfig.json file
        typescript(),

        // React requires the NODE_ENV value and we add IS_DEBUG to determine whether to render exception stack traces
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'IS_DEBUG': JSON.stringify(env === 'development'),
            preventAssignment: true,
        }),

        // During a build, copy static files to the output folder
        copy({
            targets: [
                { src: 'favicon.ico', dest: outputFolder },
                { src: ['index.html', 'css/*'], dest: outputFolder },
                { src: 'spa.config.json', dest: outputFolder },
            ],
        }),

        env === 'development' ? [

            // Add development plugins to copy files to the dist folder
            copyOnEdit(),
            openBrowser(),

        ] : [

            // For production builds, adjust bundle output and write the final CSS and HTML
            terser(),
            renderBundles(timestamp),
            finalizeBundles(),
            writeCssAndHtml(outputFolder, timestamp),
        ]
    ],
};

export default defineConfig(options);
