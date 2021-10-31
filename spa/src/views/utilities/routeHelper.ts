/*
 * A utility class to determine the current route
 */
export class RouteHelper {

    /*
     * Return true if we are in the main companies list
     */
    public static isInHomeView(): boolean {
        return !RouteHelper.isInLoginRequiredView() && (location.hash.indexOf('company=') === -1);
    }

    /*
     * Return true if we are in one of the main views and user info should also load
     */
    public static isInMainView(): boolean {
        return !RouteHelper.isInLoginRequiredView();
    }

    /*
     * Return true if we are in the logged out view
     */
    public static isInLoginRequiredView(): boolean {
        return location.hash.indexOf('loggedout') !== -1;
    }
}
