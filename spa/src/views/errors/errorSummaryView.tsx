import React from 'react';
import ReactModal from 'react-modal';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {ErrorDetailsView} from './errorDetailsView';
import {ErrorSummaryViewProps} from './errorSummaryViewProps';
import {ErrorSummaryViewState} from './errorSummaryViewState';

/*
 * Manages rendering of error summary information
 */
export class ErrorSummaryView extends React.Component<ErrorSummaryViewProps, ErrorSummaryViewState> {

    public constructor(props: ErrorSummaryViewProps) {
        super(props);

        // Initialise state and ensure that the error is the expected type for display
        this.state = {
            showDetails: false,
            error: props.error ? ErrorHandler.getFromException(props.error) : null,
        };

        this._setupCallbacks();
    }

    /*
     * If the error state changes we update state used for rendering
     */
    public static getDerivedStateFromProps(
        nextProps: ErrorSummaryViewProps,
        prevState: ErrorSummaryViewState): ErrorSummaryViewState | null {

        // Return updated state
        if (nextProps.error !== prevState.error) {
            return {
                error: nextProps.error,
                showDetails: false,
            };
        }

        // Indicate no changes to state
        return null;
    }

    /*
     * Render the error hyperlink, and show the modal dialog when the user selects it
     */
    public render(): React.ReactNode {

        // If there is no real error, do not render anything
        if (!this.state.error || this.state.error.errorCode === ErrorCodes.loginRequired) {
            return  (
                <>
                </>
            );
        }

        if (this.props.centred) {

            return (

                // Render the hyperlink as a centred row in the main UI
                <>
                    <div className='row'>
                        <div className='col-6 text-center mx-auto'>
                            {this._renderHyperlink()}
                        </div>
                    </div>
                    {this._renderModalDialog()}
                </>

            );
        } else {

            return (

                // Render the hyperlink in a more compact form, used for user info errors
                <>
                    {this._renderHyperlink()}
                    {this._renderModalDialog()}
                </>
            );
        }
    }

    /*
     * Return the markup for the hyperlink
     */
    private _renderHyperlink(): React.ReactNode {

        return (
            <a href='#' className='errorcolor largetext text-center' onClick={this._handleSummaryClick}>
                {this.props.hyperlinkMessage}
            </a>
        );
    }

    /*
     * Return the markup for the modal dialog
     */
    private _renderModalDialog(): React.ReactNode {

        const errorDetailsProps = {
            title: this.props.dialogTitle,
            error: this.state.error!,
            handleClose: this._handleDetailsDialogClose,
        };

        const customStyles = {
            overlay: {
                backgroundColor: 'lightgray',
            },
        };

        return (

            <ReactModal
                isOpen={this.state.showDetails}
                onRequestClose={this._handleDetailsDialogClose}
                contentLabel={this.props.dialogTitle}
                style={customStyles}
            >
                <ErrorDetailsView {...errorDetailsProps}/>
            </ReactModal>
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
