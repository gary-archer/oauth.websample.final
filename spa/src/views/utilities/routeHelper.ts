/*
 * A utility class to determine the current route
 */
export class RouteHelper {

    /*
     * Return true if we are in the main companies list
     */
    public static isInHomeView(): boolean {
        return !RouteHelper.isInLoginRequiredView() && (location.href.indexOf('companies') === -1);
    }

    /*
     * Return true if we are in the logged out view
     */
    public static isInLoginRequiredView(): boolean {
        return location.href.indexOf('loggedout') !== -1;
    }
}
