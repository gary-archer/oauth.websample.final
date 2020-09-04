import moment from 'moment';
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

        // Display technical details that are OK to show to users
        lines.push(this._createErrorLine('User Action', error.userAction, 'highlightcolor'));

        if (error.message.length > 0) {
            lines.push(this._createErrorLine('Info', error.message));
        }

        if (error.area.length > 0) {
            lines.push(this._createErrorLine('Area', error.area));
        }

        if (error.errorCode.length > 0) {
            lines.push(this._createErrorLine('Error Code', error.errorCode));
        }

        if (error.statusCode > 0) {
            lines.push(this._createErrorLine('Status Code', error.statusCode.toString()));
        }

        if (error.instanceId > 0) {
            lines.push(this._createErrorLine('Id', error.instanceId.toString(), 'errorcolor'));
        }

        if (error.appAuthCode.length > 0) {
            lines.push(this._createErrorLine('AppAuth Code', error.appAuthCode.toString()));
        }

        if (error.utcTime.length > 0) {
            const displayTime = moment(error.utcTime).format('DD MMM YYYY HH:mm:ss');
            lines.push(this._createErrorLine('UTC Time', displayTime));
        }

        if (error.details.length > 0) {
            lines.push(this._createErrorLine('Details', error.details));
        }

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
        if (SHOW_STACK_TRACE) {
            if (error.stack) {
                return this._createErrorLine('Stack', error.stack);
            }
        }

        return null;
    }

    /*
     * Return an error line as an object
     */
    private _createErrorLine(label: string, value: string, valueStyle: string = 'valuecolor'): ErrorLine {

        return {
            id: ++this._count,
            label,
            value,
            valueStyle,
        };
    }
}
