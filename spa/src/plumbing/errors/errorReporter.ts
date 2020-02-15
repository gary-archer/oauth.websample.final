import moment from 'moment';
import {ErrorLine} from './errorLine';
import {UIError} from './uiError';

/*
 * For silent token renewal errors we avoid impacting the end user and output to the console
 */
export class ErrorReporter {

    /*
     * Get errors ready for display
     */
    public getErrorLines(error: UIError): ErrorLine[] {

        const lines: ErrorLine[] = [];
        let count = 0;

        // Display technical details that are OK to show to users
        if (error.message.length > 0) {
            lines.push(this._createErrorLine(++count, 'Info', error.message));
        }

        if (error.area.length > 0) {
            lines.push(this._createErrorLine(++count, 'Area', error.area));
        }

        if (error.errorCode.length > 0) {
            lines.push(this._createErrorLine(++count, 'Error Code', error.errorCode));
        }

        if (error.statusCode > 0) {
            lines.push(this._createErrorLine(++count, 'Status Code', error.statusCode.toString()));
        }

        if (error.instanceId > 0) {
            lines.push(this._createErrorLine(++count, 'Id', error.instanceId.toString()));
        }

        if (error.utcTime.length > 0) {
            const displayTime = moment(error.utcTime).format('DD MMM YYYY HH:mm:ss');
            lines.push(this._createErrorLine(++count, 'UTC Time', displayTime));
        }

        if (error.details.length > 0) {
            lines.push(this._createErrorLine(++count, 'Details', error.details));
        }

        if (error.url.length > 0) {
            lines.push(this._createErrorLine(++count, 'URL', error.url));
        }

        // In debug builds render the stack trace as a long string
         // We can then look up results at https://sourcemaps.info
         if (SHOW_STACK_TRACE) {
            if (error.stack) {
                lines.push(this._createErrorLine(++count, 'Stack', error.stack));
            }
        }

        return lines;
    }

    /*
     * For silent token renewal errors we avoid impacting the end user and output to the console
     */
    public outputToConsole(error: UIError) {

        const lines = this.getErrorLines(error);
        lines.forEach((l) => {
            console.log(`${l.title}: ${l.value}`);
        });
    }

    /*
     * Return an error line as an object
     */
    private _createErrorLine(id: number, title: string, value: string): ErrorLine {

        return {
            id,
            title,
            value,
        } as ErrorLine;
    }
}
