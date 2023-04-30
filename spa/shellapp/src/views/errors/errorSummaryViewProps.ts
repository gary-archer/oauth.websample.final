import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the error summary view
 */
export interface ErrorSummaryViewProps {

    // The error, when applicable
    error: UIError | null;

    // A retry action
    onRetry: () => void;
}
