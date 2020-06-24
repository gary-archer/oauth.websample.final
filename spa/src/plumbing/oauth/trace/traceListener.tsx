import {Log, Logger} from 'oidc-client';
import {EventEmitter} from '../../events/eventEmitter';
import {EventNames} from '../../events/eventNames';
import {OidcLogLevel} from './oidcLogLevel';

/*
 * The trace listener receives OIDC library debug output
 */
export class TraceListener implements Logger {

    private _messageCount: number;
    private readonly _oidcLogLevel: OidcLogLevel;

    public constructor() {

        // Initialise properties
        this._messageCount = 0;
        Log.logger = this;
        this._oidcLogLevel = new OidcLogLevel();

        // Set up the this parameter in callbacks
        this._setupCallbacks();
    }

    /*
     * Update the log level after a URL hash change if required
     */
    public updateLogLevelIfRequired(): void {
        this._oidcLogLevel.updateLevelIfRequired();
    }

    /*
     * Capture OIDC logs
     */
    public error(message?: any, ...optionalParams: any[]): void {
        this._dispatchTraceEvent('Oidc.Error', message, optionalParams);
    }

    public warn(message?: any, ...optionalParams: any[]): void {
        this._dispatchTraceEvent('Oidc.Warn', message, optionalParams);

    }

    public info(message?: any, ...optionalParams: any[]): void {
        this._dispatchTraceEvent('Oidc.Info', message, optionalParams);

    }

    public debug(message?: any, ...optionalParams: any[]): void {
        this._dispatchTraceEvent('Oidc.Debug', message, optionalParams);
    }

    /*
     * Translate OIDC raw data to a trace line and dispatch for rendering
     */
    private _dispatchTraceEvent(prefix: string, message?: any, ...optionalParams: any[]): void {

        const fullMessage = [message, ...optionalParams].join(' ');

        // Create the trace line
        const line = {
            id: ++this._messageCount,
            prefix,
            message: fullMessage,
        };

        // Dispatch it to the view via an event
        EventEmitter.dispatch(EventNames.ON_TRACE, line);
    }

    /*
     * Ensure that the this parameter is available in callbacks
     */
    private _setupCallbacks() {
        this._dispatchTraceEvent = this._dispatchTraceEvent.bind(this);
    }
}
