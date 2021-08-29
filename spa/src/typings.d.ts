// This is set by webpack and we use it to show stack traces in development builds
declare const SHOW_STACK_TRACE: boolean;

// With these types, webpack builds a separate bundle file for the web worker
declare module 'worker-loader!*' {

    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}
