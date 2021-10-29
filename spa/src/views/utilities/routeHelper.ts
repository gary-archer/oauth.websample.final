/*
 * A utility class to determine the current route
 */
export class RouteHelper {

    /*
     * Return true if we are not in the logged out view or the transactions view
     */
    public static isInHomeView(): boolean {
        return (location.hash.indexOf('loggedout') === -1) && (location.hash.indexOf('company=') === -1);
    }

    /*
     * Return true if we are in the logged out view
     */
    public static isInLoggedOutView(): boolean {
        return location.hash.indexOf('loggedout') !== -1;
    }
}
