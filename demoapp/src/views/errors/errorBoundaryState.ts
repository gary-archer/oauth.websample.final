import {UIError} from '../../plumbing/errors/uiError';

/*
 * Used to render a fallback UI when there is a rendering error
 */
export interface ErrorBoundaryState {
    error: UIError | null;
}
