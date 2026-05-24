import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs/promises';
import path from 'path';
import {PurgeCSS} from 'purgecss';
import {defineConfig, RollupOptions} from 'rollup';
import copy from 'rollup-plugin-copy';
import {writeProductionAssets} from './writeProductionAssets';

const env = process.env.ROLLUP_WATCH === 'true' ? 'development' : 'production';
const timestamp = new Date().getTime().toString();

const options: RollupOptions = {

    input: 'src/index.tsx',
    output: {

        // Build ECMAScript modules to the dist folder
        dir: 'dist',
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
        typescript({
            sourceMap: true,
        }),

        // React requires the NODE_ENV value and we add IS_DEBUG to determine whether to render exception stack traces
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'IS_DEBUG': JSON.stringify(env === 'development'),
            preventAssignment: true,
        }),

        // During a build, copy static files to the output folder
        copy({
            targets: [
                { src: 'favicon.ico', dest: 'dist' },
                { src: ['index.html', 'css/*'], dest: 'dist' },
                { src: 'spa.config.json', dest: 'dist' },
            ],
        }),

        env === 'development' ? [

            // A simple plugin to copy these files to the output folder when edited
            {
                name: 'watch-external',
                buildStart() {
                    this.addWatchFile('index.html');
                    this.addWatchFile('css');
                    this.addWatchFile('spa.config.json');
                },
            },

        ] : [

            // A simple plugin to add cache-busting timestamps to references inside bundles
            {
                name: 'add-timestamp-to-bundle-refs',
                renderChunk(code: string) {

                    const timestamped = `.bundle.js?t=${timestamp}`;
                    return {
                        code: code.replace(/\.bundle\.js\b/g, timestamped),
                        map: null,
                    };
                }
            },

            // Minimize bundles
            terser(),

            // Run final logic when the build completes
            {
                name: 'rewrite-output',
                async writeBundle() {

                    // Produce minified CSS
                    const result = await new PurgeCSS().purge({
                        css: ['css/bootstrap.css'],
                        content: ['dist/app.bundle.js'],
                        safelist: ['body', 'container'],
                    });
                    await fs.writeFile('dist/bootstrap.css', result[0].css);

                    // Use custom code to rewrite the index.html file
                    writeProductionAssets(timestamp);
                }
            }
        ]
    ],
};

export default defineConfig(options);
