import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the error summary view
 */
export interface ErrorSummaryViewProps {
    error: UIError | null;
}
