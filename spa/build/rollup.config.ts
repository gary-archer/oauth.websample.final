import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import {defineConfig, RollupOptions} from 'rollup';
import copy from 'rollup-plugin-copy';
// import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import {getConfigurationFile} from './utils';

const env = process.env.ROLLUP_WATCH === 'true' ? 'development' : 'production';
const options: RollupOptions = {

    input: './src/index.tsx',
    output: {

        // Build ECMAScript modules to the dist folder
        dir: '../dist/spa',
        format: 'esm',
        sourcemap: true,

        // Indicate the initial chunk that contains application source code
        entryFileNames: 'app.bundle.js',

        // Indicate chunks to output, which include chunks created from dynamic imports
        chunkFileNames: '[name].bundle.js',

        // Indicate fixed vendor chunks referenced in index.html
        manualChunks: (id: string) => {

            if (id.includes('node_modules') && !id.includes('react')) {
                return 'vendor';
            }

            if (id.includes('node_modules') && id.includes('react')) {
                return 'react';
            }
        },
    },
    onwarn(warning, warn) {

        // Work around this issue with React Router
        /* eslint-disable-next-line max-len */
        // - https://stackoverflow.com/questions/76694615/module-level-directives-cause-errors-when-bundled-use-client-was-ignored-caus
        if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') {
            warn(warning);
        }
    },
    plugins: [

        // Use tslib and the typescript plugin with the settings from the configuration file
        typescript({
            tsconfig: './tsconfig.json',
        }),

        // Use browser resolution for node_modules
        resolve({
            browser: true,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        }),

        // Handle any commonjs modules in mode_modules folder
        commonjs({
            include: 'node_modules/**',
        }),

        // Define 'environment variables' that will be present in the browser
        replace({
            'process.env.NODE_ENV': JSON.stringify(env),
            'process.env.IS_DEBUG': env === 'development',
            preventAssignment: true,
        }),

        // Copy other static files
        copy({
            targets: [
                { src: '../favicon.ico', dest: '../dist' },
                { src: ['index.html', 'css/*'], dest: '../dist/spa' },
                { src: getConfigurationFile(), dest: '../dist/spa' },
            ],
        }),

        // Minify production bundles
        env !== 'development' && terser(),

        // Run a development static content server
        env === 'development' &&

            // Use a development static content server
            serve({
                port: 443,
                host: 'www.authsamples-dev.com',
                https: {
                    pfx: fs.readFileSync('../certs/authsamples-dev.ssl.p12'),
                    passphrase: 'Password1',
                },
                historyApiFallback: true,
                open: true,
                openPage: '/spa',
                contentBase: '../dist',
            }),
            // livereload('../dist/spa'),
    ],
};

export default defineConfig(options);
