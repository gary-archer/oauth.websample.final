import {UIError} from '../plumbing/errors/uiError';

/*
 * Application level state used for rendering
 */
export interface AppState {

    // Whether the view has processed configuration and created global objects
    isInitialised: boolean;

    // Visibility of elements changes in this view
    isInLoggedOutView: boolean;

    // The main view's loaded state
    hasData: boolean;

    // Record when the size changes to that of a mobile phone
    isMobileSize: boolean;

    // The application level error object
    error: UIError | null;
}
