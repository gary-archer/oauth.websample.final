import {UIError} from '../plumbing/errors/uiError';

/*
 * Application level state used for rendering
 */
export interface AppState {

    // True while startup configuration is being processed
    isStarting: boolean;

    // Some controls are hidden during view loading and shown afterwards
    isMainViewLoaded: boolean;

    // Populated when there is an application level error
    applicationError: UIError | null;

    // Record when the size changes to that of a mobile phone
    isMobileSize: boolean;
}
