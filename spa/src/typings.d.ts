/*
 * Needed to export our web worker that looks after access tokens
 */

declare module 'worker-loader!*' {

    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}
