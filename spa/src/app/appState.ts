import {UIError} from '../plumbing/errors/uiError';

/*
 * Application level state used for rendering
 */
export interface AppState {

    // Whether the app has started up, read configuration and created global objects
    isInitialised: boolean;

    // After login this is used to keep track of whether all views have loaded their API data
    isDataLoaded: boolean;

    // Record when the size changes to that of a mobile phone
    isMobileSize: boolean;

    // The application level error object
    error: UIError | null;
}
