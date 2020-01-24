import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the error summary view
 */
export interface ErrorSummaryViewProps {

    // A short message to display in the hyperlink
    hyperlinkMessage: string;

    // The title to show in the modal dialog
    dialogTitle: string;

    // The error object
    error: UIError | null;
}
