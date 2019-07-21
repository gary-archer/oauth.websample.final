import * as Oidc from 'oidc-client';
import {UrlHelper} from '../utilities/urlHelper';

/*
 * A helper class to deal with logging logic
 */
export class OAuthLogger {

    /*
     * Called from the TraceView to initialize OIDC Client logging from an appender and set the startup log level
     */
    public static initialize(appender: (prefix: string, args: any) => void): number {

        // Set this class to OIDC Client's logger
        Oidc.Log.logger = OAuthLogger;

        // Store the callback, which updates the trace view
        this._appender = appender;

        // Derive the log level from the URL, which can be set to values such as #log=info
        const level = OAuthLogger._getUrlLogLevel();
        OAuthLogger._setLevel(level);

        // Return the level to the trace view so that UI elements can be updated
        return level;
    }

    /*
     * Update the OIDC log level if the hash log parameter has changed
     */
    public static updateLevelIfRequired(): number {

        // Get old and new levels
        const oldLevel = OAuthLogger._getStoredLogLevel();
        const newLevel = OAuthLogger._getUrlLogLevel();

        // Update if required
        if (newLevel !== oldLevel) {
            OAuthLogger._setLevel(newLevel);
        }

        return newLevel;
    }

    /*
     * The console.log overrides that OIDC Client logging calls
     */
    public static debug(...args: any[]): void {
        this._appender('Oidc.Debug', args);
    }

    public static info(...args: any[]): void {
        this._appender('Oidc.Info', args);
    }

    public static warn(...args: any[]): void {
        this._appender('Oidc.Warn', args);
    }

    public static error(...args: any[]): void {
        this._appender('Oidc.Error', args);
    }

    /*
     * This callback is the Trace View's append method
     */
    private static _appender: (prefix: string, args: any) => void;

    /*
     * Get the log level from the URL's hash parameter, such as #log=info
     */
    private static _getUrlLogLevel(): number {

        const validLevels = new Map<string, number>([
            ['none',  Oidc.Log.NONE],
            ['debug', Oidc.Log.DEBUG],
            ['info',  Oidc.Log.INFO],
            ['warn',  Oidc.Log.WARN],
            ['error', Oidc.Log.ERROR],
        ]);

        // If a value such as log=info is present in the URL then return the numeric level for info
        const hashData = UrlHelper.getLocationHashData();
        if (hashData.log) {
            const foundLevel = validLevels.get(hashData.log);
            if (foundLevel !== undefined) {
                return foundLevel;
            }
        }

        // Otherwise return the stored value or default to no logging
        return OAuthLogger._getStoredLogLevel();
    }

        /*
     * Set the log level in the session so that it is inherited on page reloads and by the renewal iframe
     */
    private static _setLevel(level: number): void {

        Oidc.Log.level = level;
        sessionStorage.setItem('basicSpa.logLevel', level.toString());
    }

    /*
     * Get the value from session storage if it exists
     */
    private static _getStoredLogLevel(): number {

        const oldLevelString = sessionStorage.getItem('basicSpa.logLevel');
        if (oldLevelString) {
            return parseInt(oldLevelString, 10);
        }

        return Oidc.Log.NONE;
    }
}
