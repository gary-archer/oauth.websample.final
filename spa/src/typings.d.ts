/*
 * This is needed in TypeScript projects, so that Webpack builds a separate bundle file for the web worker
 */

declare module 'worker-loader!*' {

    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}
