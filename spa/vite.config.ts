import fs from 'fs';
import {ConfigEnv, defineConfig, UserConfig} from 'vite';

// const dirname = process.cwd();
export default defineConfig((configEnv: ConfigEnv) => {

    return {
        base: '/spa',
        build: {
            minify: configEnv.mode === 'production',
            outDir: 'dist',
            rollupOptions: {
                input: './src/index.tsx',
                output: {

                    entryFileNames: 'app.bundle.js',
                    chunkFileNames: '[name].bundle.js',
                    manualChunks: (id: string) => {

                        if (id.includes('node_modules')) {
                            if (id.includes('react')) {
                                return 'react';
                            } else {
                                return 'vendor';
                            }
                        }
                    },
                    sourcemap: true,
                },
            }
        },
        define: {
            IS_DEBUG: `${configEnv.mode === 'development'}`
        },
        server: {
            port: 443,
            allowedHosts: ['www.authsamples-dev.com'],
            https: {
                pfx: fs.readFileSync('../certs/authsamples-dev.ssl.p12'),
                passphrase: 'Password1',
            },
            open: 'https://www.authsamples-dev.com/spa'
        },

    } as UserConfig;
});
