import {ErrorFormatter} from './errorFormatter';
import {UIError} from './uiError';

/*
 * A utility class for errors we don't want to bother the user about
 */
export class ErrorConsoleReporter {

    /*
     * Output error fields as name / value pairs
     */
    public static output(error: UIError): void {

        const fields = new ErrorFormatter().getErrorFields(error);
        fields.forEach((f) => {
            console.log(`${f.label}: ${f.value}`);
        });
    }
}
