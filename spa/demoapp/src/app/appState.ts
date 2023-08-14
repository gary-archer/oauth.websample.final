import {UIError} from '../plumbing/errors/lib';

/*
 * Application level state used for rendering
 */
export interface AppState {
    isInitialised: boolean;
    isMobileLayout: boolean;
    error: UIError | null;
}
