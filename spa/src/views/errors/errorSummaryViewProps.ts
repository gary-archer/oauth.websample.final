/*
 * Input to the error summary view
 */
export interface ErrorSummaryViewProps {

    // The containing view
    containingViewName: string;

    // A short message to display in the hyperlink
    hyperlinkMessage: string;

    // The title to show in the modal dialog
    dialogTitle: string;

    // Usually set to true so that the hyperlink is rendered centrally as a new row
    centred: boolean;
}
