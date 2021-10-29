import {UIError} from '../plumbing/errors/uiError';

/*
 * Application level state used for rendering
 */
export interface AppState {

    // Whether the view has processed configuration and created global objects
    isInitialised: boolean;

    // Record when the size changes to that of a mobile phone
    isMobileLayout: boolean;

    // The application level error object
    error: UIError | null;
}
