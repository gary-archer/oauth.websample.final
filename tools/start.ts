import {spawn} from 'child_process';

/*
 * Run a development server to serve static content
 */
console.log('Running development web server ...');
const server = spawn(
    'tsx',
    ['tools/developmentWebServer.ts'],
    {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    }
);

/*
 * Run the rollup bundler in watch mode
 */
console.log('Starting rollup build ...');
const rollup = spawn(
    'rollup',
    ['--config', 'build/rollup.config.ts', '--watch'],
    {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env: {
            ...process.env,
            NODE_OPTIONS: '--import tsx',
        },
    }
);

/*
 * Handle shutdown
 */
function shutdown() {
    rollup.kill();
    server.kill();
    process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
