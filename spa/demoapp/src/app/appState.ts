import {UIError} from '../plumbing/errors/lib';

/*
 * Application level state used for rendering
 */
export interface AppState {
    isMobileLayout: boolean;
    error: UIError | null;
}
