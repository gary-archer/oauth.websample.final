import moment from 'moment';
import {ErrorLine} from './errorLine';
import {UIError} from './uiError';

/*
 * A class to manage error formatting
 */
export class ErrorFormatter {

    /*
     * Get errors ready for display
     */
    public static getErrorLines(error: UIError): ErrorLine[] {

        const lines: ErrorLine[] = [];
        let count = 0;

        // Display technical details that are OK to show to users
        if (error.message.length > 0) {
            lines.push(ErrorFormatter._createErrorLine(++count, 'Info', error.message));
        }

        if (error.area.length > 0) {
            lines.push(ErrorFormatter._createErrorLine(++count, 'Area', error.area));
        }

        if (error.errorCode.length > 0) {
            lines.push(ErrorFormatter._createErrorLine(++count, 'Error Code', error.errorCode));
        }

        if (error.statusCode > 0) {
            lines.push(ErrorFormatter._createErrorLine(++count, 'Status Code', error.statusCode.toString()));
        }

        if (error.instanceId > 0) {
            lines.push(ErrorFormatter._createErrorLine(++count, 'Id', error.instanceId.toString()));
        }

        if (error.appAuthCode.length > 0) {
            lines.push(ErrorFormatter._createErrorLine(++count, 'AppAuth Code', error.appAuthCode.toString()));
        }

        if (error.utcTime.length > 0) {
            const displayTime = moment(error.utcTime).format('DD MMM YYYY HH:mm:ss');
            lines.push(ErrorFormatter._createErrorLine(++count, 'UTC Time', displayTime));
        }

        if (error.details.length > 0) {
            lines.push(ErrorFormatter._createErrorLine(++count, 'Details', error.details));
        }

        if (error.url.length > 0) {
            lines.push(ErrorFormatter._createErrorLine(++count, 'URL', error.url));
        }

        // In debug builds render the stack trace as a long string
         // We can then look up results at https://sourcemaps.info
        if (SHOW_STACK_TRACE) {
            if (error.stack) {
                lines.push(ErrorFormatter._createErrorLine(++count, 'Stack', error.stack));
            }
        }

        return lines;
    }

    /*
     * Return an error line as an object
     */
    private static _createErrorLine(id: number, title: string, value: string): ErrorLine {

        return {
            id,
            title,
            value,
        } as ErrorLine;
    }
}
