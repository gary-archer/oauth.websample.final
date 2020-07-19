import {Log} from 'oidc-client';
import urlparse from 'url-parse';
import {HtmlStorageHelper} from '../../../utilities/htmlStorageHelper';

/*
 * A helper class to deal with calculating and storing the log level
 */
export class OidcLogLevel {

    private readonly _logLevelKey = 'finalspa.oidcloglevel';

    /*
     * Set the initial log level
     */
    public constructor() {

        // Use the URL if specified, or the stored value otherwise
        let level = this._getUrlLogLevel();
        if (!level) {
            level = this._getStoredLogLevel();
        }

        this._setLogLevel(level);
    }

    /*
     * If the URL has been updated such as to #/?log=debug, then update the OIDC Client logging level
     */
    public updateLevelIfRequired(): void {

        const newLevel = this._getUrlLogLevel();
        if (newLevel !== this._getStoredLogLevel()) {
            this._setLogLevel(newLevel);
        }
    }

    /*
     * Get the log level from a query parameter in the hash URL, such as #/companies=2&log=info
     */
    private _getUrlLogLevel(): string {

        if (location.hash.startsWith('#')) {

            const data = urlparse('?' + location.hash.substring(1), true);
            const logLevel = data.query.log;
            if (logLevel) {
                return logLevel.toLowerCase();
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
     * Set the log level in the session so that it is inherited on page reloads and by the renewal iframe
     */
    private _setLogLevel(level: string): void {

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
            HtmlStorageHelper.oidcLogLevel = levelToSet;
            Log.level = numericLevel;
        }
    }
}
