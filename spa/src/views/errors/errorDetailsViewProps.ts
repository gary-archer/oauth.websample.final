import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the error details view
 */
export interface ErrorDetailsViewProps {

    // The title to show in the display
    title: string;

    // The input error
    error: UIError;

    // Call back the summary view to close the dialog
    handleClose: () => void;
}
