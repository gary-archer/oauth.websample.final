import {ErrorField} from './errorField';
import {UIError} from './uiError';

/*
 * A class to manage error formatting
 */
export class ErrorFormatter {

    private count = 0;

    /*
     * Get error fields ready with formatted values
     */
    public getErrorFields(error: UIError): ErrorField[] {

        const fields: ErrorField[] = [];

        /* FIELDS FOR THE END USER */

        // Keep the user informed and suggest an action
        fields.push(this.createErrorField('User Action', error.getUserAction(), 'useraction'));

        // Give the user summary level info, such as 'Network error'
        if (error.message.length > 0) {
            fields.push(this.createErrorField('Info', error.message, 'value'));
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
            fields.push(this.createErrorField('UTC Time', displayTime, 'value'));
        }

        // Indicate the area of the system, such as which component failed
        if (error.getArea().length > 0) {
            fields.push(this.createErrorField('Area', error.getArea(), 'value'));
        }

        // Indicate the type of error
        if (error.getErrorCode().length > 0) {
            fields.push(this.createErrorField('Error Code', error.getErrorCode(), 'value'));
        }

        // Link to API logs if applicable
        if (error.getInstanceId() > 0) {
            fields.push(this.createErrorField('Instance Id', error.getInstanceId().toString(), 'identifier'));
        }

        // Show the HTTP status if applicable
        if (error.getStatusCode() > 0) {
            fields.push(this.createErrorField('Status Code', error.getStatusCode().toString(), 'value'));
        }

        /* FIELDS FOR SOFTWARE ENGINEERS */

        // Show details for some types of error
        if (error.getDetails().length > 0) {
            fields.push(this.createErrorField('Details', error.getDetails(), 'value'));
        }

        // Show the URL that failed if applicable
        if (error.getUrl().length > 0) {
            fields.push(this.createErrorField('URL', error.getUrl(), 'value'));
        }

        return fields;
    }

    /*
     * Return the stack separately, since it is rendered in smaller text
     */
    public getErrorStack(error: UIError): ErrorField | null {

        // In debug builds render the stack trace as a long string
        // We can then look up results at https://sourcemaps.info
        if (IS_DEBUG) {
            if (error.stack) {
                return this.createErrorField('Stack', error.stack, 'stack');
            }
        }

        return null;
    }

    /*
     * Return an field object
     */
    private createErrorField(
        label: string,
        value: string,
        itemType: 'useraction' | 'value' | 'identifier' | 'stack'): ErrorField {

        return {
            id: ++this.count,
            label,
            value,
            itemType,
        };
    }
}
