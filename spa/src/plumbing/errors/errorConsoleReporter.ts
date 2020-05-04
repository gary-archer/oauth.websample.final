import {ErrorFormatter} from './errorFormatter';
import {ErrorHandler} from './errorHandler';

/*
 * A utility class for errors we don't want to bother the user about
 */
export class ErrorConsoleReporter {

    /*
     * Output error fields as name / value pairs
     */
    public static output(error: any) {

        const uiError = ErrorHandler.getFromException(error);
        const lines = ErrorFormatter.getErrorLines(uiError);

        lines.forEach((l) => {
            console.log(`${l.title}: ${l.value}`);
        });
    }
}
