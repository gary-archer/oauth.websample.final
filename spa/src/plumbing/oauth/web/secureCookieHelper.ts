/*
 * Since we use a refresh token inside an HTTP only cookie, send a CSRF field to accompany it
 */
export class SecureCookieHelper {

    private static readonly _fieldName = 'csrf_field';

    /*
     * Store the field when we receive it in a response
     */
    public static readCsrfFieldFromResponse(response: any) {

        if (response.csrf_field) {
            localStorage.setItem(this._fieldName, response.csrf_field);
        }
    }

    /*
     * Add the stored field to an outgoing request
     */
    public static addCsrfFieldToRequest(formData: any) {

        const value = localStorage.getItem(this._fieldName);
        if (value) {
            if (formData.append) {
                formData.append(this._fieldName, value);
            } else {
                formData[this._fieldName] = value;
            }
        }
    }
}