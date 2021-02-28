import {Log} from 'oidc-client';
import urlparse from 'url-parse';
import {HtmlStorageHelper} from '../../../utilities/htmlStorageHelper';

/*
 * A helper class to deal with calculating and storing the log level
 */
export class OidcLogger {

    /*
     * Set the initial log details
     */
    public constructor() {

        Log.logger = console;

        let level = this._getUrlLogLevel();
        if (!level) {
            level = this._getStoredLogLevel();
        }

        this._setLogLevel(level);
    }

    /*
     * If the URL has been updated such as to #log=debug, then update the OIDC Client logging level
     */
    public updateLogLevelIfRequired(): void {

        const newLevel = this._getUrlLogLevel();
        if (newLevel && newLevel !== this._getStoredLogLevel()) {
            this._setLogLevel(newLevel);
            HtmlStorageHelper.oidcLogLevel = newLevel;
        }
    }

    /*
     * Get the log level from a query parameter in the hash URL, such as #companies=2&log=info
     */
    private _getUrlLogLevel(): string {

        if (location.hash.startsWith('#')) {

            const hashFragment = location.hash.substring(1).replace(/^\//, '');
            if (hashFragment) {
                const data = urlparse('?' + hashFragment, true);
                const logLevel = data.query.log;
                if (logLevel) {
                    return logLevel.toLowerCase();
                }
            }
        }

        return '';
    }

    /*
     * Get the value from session storage if it exists
     */
    private _getStoredLogLevel(): string {
        return HtmlStorageHelper.oidcLogLevel;
    }

    /*
     * Update the log level
     */
    private _setLogLevel(level: string): void {

        const data: { [key: string]: number | undefined } = {
            none:  Log.NONE,
            error: Log.ERROR,
            warn:  Log.WARN,
            info:  Log.INFO,
            debug: Log.DEBUG,
        };

        const levelToSet = level || 'none';
        const numericLevel = data[levelToSet];
        if (numericLevel !== undefined) {
            Log.level = numericLevel;
        }
    }
}
