/*
 * A utility class to append URLs
 */
export class UrlHelper {

    /*
     * In AWS we use a trailing / in the redirect URI, to prevent an unwanted redirect from /spa?code=xxx to /spa/
     */
    public static append(baseUrl: string, path: string) {

        const baseUriWithTrailingSlash = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        return `${baseUriWithTrailingSlash}${path}`;

    }
}
