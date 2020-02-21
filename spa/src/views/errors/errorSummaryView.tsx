import React from 'react';
import ReactModal from 'react-modal';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorDetailsView} from './errorDetailsView';
import {ErrorSummaryViewProps} from './errorSummaryViewProps';
import {ErrorSummaryViewState} from './errorSummaryViewState';

/*
 * Manages rendering of error summary information
 */
export class ErrorSummaryView extends React.Component<ErrorSummaryViewProps, ErrorSummaryViewState> {

    public constructor(props: any) {
        super(props);

        this.state = {
            showDetails: false,
        };

        this._setupCallbacks();
    }

    /*
     * Render the error hyperlink, and show the modal dialog when the user selects it
     */
    public render(): React.ReactNode {

        // If there is no error do not render anything
        if (!this.props.error || this.props.error.errorCode === ErrorCodes.loginRequired) {
            return  (
                <>
                </>
            );
        }

        // Otherwise show the summary hyperlink, which will open a modal dialog
        const errorDetailsProps = {
            title: this.props.dialogTitle,
            error: this.props.error,
            handleClose: this._handleDetailsDialogClose,
        };

        return  (
            <>
                <a href='#' className='errorcolor largetext text-center' onClick={this._handleSummaryClick}>
                    {this.props.hyperlinkMessage}
                </a>
                <ReactModal
                    isOpen={this.state.showDetails}
                    onRequestClose={this._handleDetailsDialogClose}
                    contentLabel={this.props.dialogTitle}
                >
                    <ErrorDetailsView {...errorDetailsProps}/>
                </ReactModal>
            </>
        );
    }

    /*
     * Invoke error details when the link is clicked
     */
    private _handleSummaryClick(event: React.MouseEvent<HTMLAnchorElement>) {
        event.preventDefault();
        this.setState({showDetails: true});
    }

    /*
     * Reset state when the dialog's close button is clicked
     */
    private _handleDetailsDialogClose() {
        this.setState({showDetails: false});
    }

    /*
     * Ensure that the this parameter is available in callbacks
     */
    private _setupCallbacks() {
        this._handleSummaryClick = this._handleSummaryClick.bind(this);
        this._handleDetailsDialogClose = this._handleDetailsDialogClose.bind(this);
    }
}
