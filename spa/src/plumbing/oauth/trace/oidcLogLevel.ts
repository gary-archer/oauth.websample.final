import {Log} from 'oidc-client';
import urlparse from 'url-parse';

/*
 * A helper class to deal with calculating and storing the log level
 */
export class OidcLogLevel {

    private readonly _logLevelKey = 'oidcloglevel';

    /*
     * Set the initial log level
     */
    public constructor() {

        // Use the URL if specified
        let level = this._getUrlLogLevel();

        // Use session storage if found
        if (level == null) {
            level = this._getStoredLogLevel();
        }

        this._setLogLevel(level);
    }

    /*
     * If the URL has been updated such as to #/?log=debug, then update the OIDC Client logging level
     */
    public updateLevelIfRequired(): void {

        const newLevel = this._getUrlLogLevel();
        if (newLevel != null) {

            if (newLevel !== this._getStoredLogLevel()) {
                this._setLogLevel(newLevel);
            }
        }
    }

    /*
     * Get the log level from a query parameter in the hash URL, such as #/companies=2&log=info
     */
    private _getUrlLogLevel(): string | null {

        if (location.hash.startsWith('#')) {

            const data = urlparse('?' + location.hash.substring(1), true);
            const logLevel = data.query.log;
            if (logLevel) {
                return logLevel.toLowerCase();
            }
        }

        return null;
    }

    /*
     * Get the value from session storage if it exists
     */
    private _getStoredLogLevel(): string | null {

        const found = localStorage.getItem(this._logLevelKey);
        return found || null;
    }

    /*
     * Set the log level in the session so that it is inherited on page reloads and by the renewal iframe
     */
    private _setLogLevel(level: string | null): void {

        const data: { [key: string]: number | undefined } = {
            none:  Log.NONE,
            debug: Log.DEBUG,
            info:  Log.INFO,
            warn:  Log.WARN,
            error: Log.ERROR,
        };

        const levelToSet = level || 'none';
        const numericLevel = data[levelToSet];
        if (numericLevel !== undefined) {

            localStorage.setItem(this._logLevelKey, levelToSet);
            Log.level = numericLevel;
        }
    }
}
