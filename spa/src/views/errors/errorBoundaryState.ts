import {UIError} from '../../plumbing/errors/uiError';

/*
 * Used for rendering of a fallback UI when there is an error
 */
export interface ErrorBoundaryState {
    error: UIError | null;
}
