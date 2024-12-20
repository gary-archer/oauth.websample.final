import {ErrorLine} from './errorLine';
import {UIError} from './uiError';

/*
 * A class to manage error formatting
 */
export class ErrorFormatter {

    private count = 0;

    /*
     * Get errors ready for display
     */
    public getErrorLines(error: UIError): ErrorLine[] {

        const lines: ErrorLine[] = [];

        /* FIELDS FOR THE END USER */

        // Keep the user informed and suggest an action
        lines.push(this.createErrorLine('User Action', error.getUserAction(), 'highlightcolor'));

        // Give the user summary level info, such as 'Network error'
        if (error.message.length > 0) {
            lines.push(this.createErrorLine('Info', error.message));
        }

        /* FIELDS FOR TECHNICAL SUPPORT STAFF */

        // Show the UTC time of the error
        if (error.getUtcTime().length > 0) {

            const errorTime = Date.parse(error.getUtcTime());
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
            lines.push(this.createErrorLine('UTC Time', displayTime));
        }

        // Indicate the area of the system, such as which component failed
        if (error.getArea().length > 0) {
            lines.push(this.createErrorLine('Area', error.getArea()));
        }

        // Indicate the type of error
        if (error.getErrorCode().length > 0) {
            lines.push(this.createErrorLine('Error Code', error.getErrorCode()));
        }

        // Link to API logs if applicable
        if (error.getInstanceId() > 0) {
            lines.push(this.createErrorLine('Instance Id', error.getInstanceId().toString(), 'errorcolor'));
        }

        // Show the HTTP status if applicable
        if (error.getStatusCode() > 0) {
            lines.push(this.createErrorLine('Status Code', error.getStatusCode().toString()));
        }

        /* FIELDS FOR SOFTWARE ENGINEERS */

        // Show details for some types of error
        if (error.getDetails().length > 0) {
            lines.push(this.createErrorLine('Details', error.getDetails()));
        }

        // Show the URL that failed if applicable
        if (error.getUrl().length > 0) {
            lines.push(this.createErrorLine('URL', error.getUrl()));
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
                return this.createErrorLine('Stack', error.stack);
            }
        }

        return null;
    }

    /*
     * Return an error line as an object
     */
    private createErrorLine(label: string, value: string, valueStyle = 'valuecolor'): ErrorLine {

        return {
            id: ++this.count,
            label,
            value,
            valueStyle,
        };
    }
}
