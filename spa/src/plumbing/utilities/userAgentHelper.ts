/*
 * A helper class to work with the user agent
 */
export class UserAgentHelper {

    /*
     * Look for Android and wv
     */
    public static isAndroidWebView(): boolean {

        const pattern = 'Android.*(wv|.0.0.0)';
        const regex = new RegExp(pattern);
        return !!navigator.userAgent.match(regex);
    }

    /*
     * Look for an iOS related string without Safari or Firefox
     * Note that up to date iPad web views use 'Macintosh' rather than 'iPad'
     */
    public static isIosWebView(): boolean {

        const pattern = '(iPhone|iPod|iPad|Macintosh)(?!.*Safari)(?!.*Firefox)';
        const regex = new RegExp(pattern);
        return !!navigator.userAgent.match(regex);
    }
}
