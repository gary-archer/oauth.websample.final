import {UIError} from '../../plumbing/errors/lib';

/*
 * The UI state of the summary view and its modal dialog
 */
export interface ErrorSummaryViewState {

    // The error is stored as state and updated when a different error occurs
    error: UIError;

    // We show the modal details dialog when the summary hyperlink is clicked
    showDetails: boolean;
}
