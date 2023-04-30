import {UIError} from '../plumbing/errors/uiError';

/*
 * Application level state used for rendering
 */
export interface AppState {

    // Whether the view has processed configuration and created global objects
    isInitialised: boolean;

    // Record when the size changes to that of a mobile phone
    isMobileLayout: boolean;

    // Populated when there is an error to display
    error: UIError | null,
}
