import {UIError} from '../plumbing/errors/uiError';

/*
 * Application level state used for rendering
 */
export interface AppState {

    // True while startup configuration is being processed
    isStarting: boolean;

    // Whether currently logged in
    isLoggedIn: boolean;

    // Whether to load user info, which occurs initially but not when in the logged out view
    loadUserInfo: boolean;

    // After login, session buttons are disabled during view loading and shown afterwards
    sessionButtonsEnabled: boolean;

    // Record when the size changes to that of a mobile phone
    isMobileSize: boolean;

    // Application level error area
    errorArea: string;

    // The application level error if applicable
    error: UIError | null;
}
