import {UIError} from '../../plumbing/errors/uiError';

/*
 * The UI state of the summary view and its modal dialog
 */
export interface ErrorSummaryViewState {

    // The error is stored as state and updated when a different error occurs
    error: UIError | null;

    // We show the modal details dialog when the summary hyperlink is clicked
    showDetails: boolean;
}
