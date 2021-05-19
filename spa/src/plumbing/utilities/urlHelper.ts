/*
 * A utility class to append URLs
 */
export class UrlHelper {

    /*
     * In AWS we use a trailing / in the redirect URI, to prevent an unwanted redirect from /spa?code=xxx to /spa/
     */
    public static append(baseUrl: string, path: string): string {

        if (!baseUrl.endsWith('/') && !path.startsWith('/')) {
            return `${baseUrl}/${path}`;
        }

        return `${baseUrl}${path}`;

    }
}
