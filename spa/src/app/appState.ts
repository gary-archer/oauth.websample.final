import {UIError} from '../plumbing/errors/uiError';

/*
 * Application level state used for rendering
 */
export interface AppState {
    isLoaded: boolean;
    isMobileLayout: boolean;
    error: UIError | null;
}
