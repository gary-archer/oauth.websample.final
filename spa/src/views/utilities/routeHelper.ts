import urlparse from 'url-parse';

/*
 * A utility class to determine the current route
 */
export class RouteHelper {

    /*
     * Return true if we are in the home view
     */
    public isInHomeView(): boolean {
        return !this.getTransactionsViewId() && !this.isInLoggedOutView();
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
    public getTransactionsViewId(): string {

        const hashData = this._getLocationHashData();
        return hashData.company;
    }

    /*
     * Get hash fragments into a dictionary
     */
    private _getLocationHashData(): any {

        if (location.hash.startsWith('#/')) {
            const data = urlparse('?' + location.hash.trim().substring(2), true);
            if (data && data.query)  {
                return data.query;
            }
        }

        return {};
    }
}