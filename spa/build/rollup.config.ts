import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import {defineConfig, RollupOptions} from 'rollup';
import copy from 'rollup-plugin-copy';

const env = process.env.ROLLUP_WATCH === 'true' ? 'development' : 'production';
const options: RollupOptions = {

    input: 'src/index.tsx',
    output: {

        // Build ECMAScript modules to the dist folder
        dir: 'dist',
        format: 'esm',

        // The app uses an entry chunk and additional vendor chunks
        entryFileNames: 'app.bundle.js',
        chunkFileNames: '[name].bundle.js',

        // Define content for the fixed vendor chunk referenced in index.html
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
        // Set the source root from the dist folder, to fix relative paths supplied to sourcemapPathTransform
        typescript({
            sourceMap: true,
            sourceRoot: '../src',
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

            // During development, if these files are directly edited, copy them to the output folder
            {
                name: 'watch-external',
                buildStart() {
                    this.addWatchFile('index.html');
                    this.addWatchFile('css');
                    this.addWatchFile('spa.config.json');
                },
            },

        ] : [

            // Minify production bundles
            terser(),
        ]
    ],
};

export default defineConfig(options);
