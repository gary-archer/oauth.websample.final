/*
 * A helper class to avoid outputting dangerous text
 */
export class HtmlEncoder {

    /*
     * Download JSON data from the app config file
     */
    public static encode(input: string): string {

        if (!input) {
            return input;
        }

        const map: {[key: string]: string} = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#039;',
            '/': '&#x2F;',
          };

        return input.replace(/[&<>"']/g, (s) => map[s] as string);
    }
}
