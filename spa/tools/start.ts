import {spawn} from 'child_process';
import open from 'open';

/*
 * Run rollup in watch mode
 */
const rollup = spawn(
    'rollup',
    ['--config', 'build/rollup.config.ts', '--watch'],
    {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_OPTIONS: '--import tsx',
        },
    }
);

/*
 * Run a development server to serve static content
 */
const server = spawn(
    'tsx',
    ['tools/developmentWebServer.ts'],
    {
        stdio: 'inherit',
    }
);

/*
 * Open the browser once content is built
 */
setTimeout(() => {
    open('https://www.authsamples-dev.com/spa/');
}, 1000);

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
