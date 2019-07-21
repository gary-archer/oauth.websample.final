/*
 * URL utilities
 */
export class UrlHelper {

    /*
     * Parse the hash fragment into an object
     */
    public static getLocationHashData(): any {

        const params: any = {};

        const idx = location.hash.indexOf('#');
        if (idx !== -1) {

            const hashParams = location.hash.slice(idx + 1).split('&');
            hashParams.map((hash) => {
                const [key, val] = hash.split('=');
                params[key] = decodeURIComponent(val);
            });
        }

        return params;
    }

    /*
     * Parse the query string into an object
     */
    public static getLocationQueryData(): any {

        const params: any = {};

        const idx = location.href.indexOf('?');
        if (idx !== -1) {

            const queryParams = location.href.slice(idx + 1).split('&');
            queryParams.map((query) => {
                const [key, val] = query.split('=');
                params[key] = decodeURIComponent(val);
            });
        }

        return params;
    }
}
