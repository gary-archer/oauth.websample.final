import React, {useState} from 'react';
import ReactModal from 'react-modal';
import {ErrorDetailsView} from './errorDetailsView';
import {ErrorSummaryViewProps} from './errorSummaryViewProps';
import {ErrorSummaryViewState} from './errorSummaryViewState';

/*
 * Manages rendering of error summary information
 */
export function ErrorSummaryView(props: ErrorSummaryViewProps): JSX.Element {

    const [state, setState] = useState<ErrorSummaryViewState>({
        showDetails: false,
        error: props.error,
    });

    /*
     * Return the markup for the hyperlink
     */
    function renderHyperlink(): JSX.Element {

        if (isNonError()) {
            return (
                <>
                </>
            );
        }

        return (
            <a href='#' className='errorcolor largetext text-center' onClick={handleSummaryClick}>
                {props.hyperlinkMessage}
            </a>
        );
    }

    /*
     * Only render real errors
     */
    function isNonError() {

        if (!state.error) {
            return true;
        }

        if (props.errorsToIgnore.indexOf(state.error.errorCode) !== -1) {
            return true;
        }

        return false;
    }

    /*
     * Return the markup for the modal dialog
     */
    function renderModalDialog(): JSX.Element {

        const errorDetailsProps = {
            title: props.dialogTitle,
            error: state.error!,
            handleClose: handleDetailsDialogClose,
        };

        const customStyles = {
            overlay: {
                backgroundColor: 'lightgray',
            },
        };

        return (

            <ReactModal
                isOpen={state.showDetails}
                onRequestClose={handleDetailsDialogClose}
                contentLabel={props.dialogTitle}
                style={customStyles}
            >
                <ErrorDetailsView {...errorDetailsProps}/>
            </ReactModal>
        );
    }

    /*
     * Invoke error details when the link is clicked
     */
    function handleSummaryClick(event: React.MouseEvent<HTMLAnchorElement>) {

        event.preventDefault();
        setState((s) => {
            return {
                ...s,
                showDetails: true,
            };
        });
    }

    /*
     * Reset state when the dialog's close button is clicked
     */
    function handleDetailsDialogClose() {

        setState((s) => {
            return {
                ...s,
                showDetails: false,
            };
        });
    }

    // Some errors, such as login required, are not rendered
    if (isNonError()) {
        return  (
            <>
            </>
        );
    }

    if (props.centred) {

        return (

            // Render the hyperlink as a centred row
            <>
                <div className='row'>
                    <div className='col-6 text-center mx-auto'>
                        {renderHyperlink()}
                    </div>
                </div>
                {renderModalDialog()}
            </>

        );
    } else {

        return (

            // Render the hyperlink in part of an existing row
            <>
                {renderHyperlink()}
                {renderModalDialog()}
            </>
        );
    }
}
