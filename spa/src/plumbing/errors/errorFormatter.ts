import {ErrorLine} from './errorLine';
import {UIError} from './uiError';

/*
 * A class to manage error formatting
 */
export class ErrorFormatter {

    private _count = 0;

    /*
     * Get errors ready for display
     */
    public getErrorLines(error: UIError): ErrorLine[] {

        const lines: ErrorLine[] = [];

        /* FIELDS FOR THE END USER */

        // Keep the user informed and suggest an action
        lines.push(this._createErrorLine('User Action', error.userAction, 'highlightcolor'));

        // Give the user summary level info, such as 'Network error'
        if (error.message.length > 0) {
            lines.push(this._createErrorLine('Info', error.message));
        }

        /* FIELDS FOR TECHNICAL SUPPORT STAFF */

        // Show the UTC time of the error
        if (error.utcTime.length > 0) {

            const errorTime = Date.parse(error.utcTime);
            const displayTime = new Date(errorTime).toLocaleString('en', {
                timeZone: 'utc',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(/,/g, '');
            lines.push(this._createErrorLine('UTC Time', displayTime));
        }

        // Indicate the area of the system, such as which component failed
        if (error.area.length > 0) {
            lines.push(this._createErrorLine('Area', error.area));
        }

        // Indicate the type of error
        if (error.errorCode.length > 0) {
            lines.push(this._createErrorLine('Error Code', error.errorCode));
        }

        // Link to API logs if applicable
        if (error.instanceId > 0) {
            lines.push(this._createErrorLine('Instance Id', error.instanceId.toString(), 'errorcolor'));
        }

        // Show the HTTP status if applicable
        if (error.statusCode > 0) {
            lines.push(this._createErrorLine('Status Code', error.statusCode.toString()));
        }

        /* FIELDS FOR SOFTWARE ENGINEERS */

        // Show details for some types of error
        if (error.details.length > 0) {
            lines.push(this._createErrorLine('Details', error.details));
        }

        // Show the URL that failed if applicable
        if (error.url.length > 0) {
            lines.push(this._createErrorLine('URL', error.url));
        }

        return lines;
    }

    /*
     * Return the stack separately, since it is rendered in smaller text
     */
    public getErrorStack(error: UIError): ErrorLine | null {

        // In debug builds render the stack trace as a long string
        // We can then look up results at https://sourcemaps.info
        if (IS_DEBUG) {
            if (error.stack) {
                return this._createErrorLine('Stack', error.stack);
            }
        }

        return null;
    }

    /*
     * Return an error line as an object
     */
    private _createErrorLine(label: string, value: string, valueStyle = 'valuecolor'): ErrorLine {

        return {
            id: ++this._count,
            label,
            value,
            valueStyle,
        };
    }
}
