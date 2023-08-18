/*
 * Constants for event names
 */
export class EventNames {

    // Raised when a view model fetches data
    public static ViewModelFetch = 'ViewModelFetch';

    // Raised when the SPA must trigger an OpenID Connect flow
    public static LoginRequired  = 'LoginRequired';

    // Raised when a UI option to reload data is selected
    public static ReloadData = 'ReloadData';
}
