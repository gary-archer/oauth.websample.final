/*
 * A utility class to determine the current route
 */
export class RouteHelper {

    /*
     * Return true if we are in the home view
     */
    public isInHomeView(): boolean {
        return !this.isInTransactionsView() && !this.isInLoggedOutView();
    }

    /*
     * Return true if we are in the logged out view
     */
    public isInLoggedOutView(): boolean {
        return location.hash.indexOf('loggedout') !== -1;
    }

    /*
     * The transactions view has a URL such as #company=2
     */
    public isInTransactionsView(): boolean {
        return location.hash.indexOf('company=') !== -1;
    }
}