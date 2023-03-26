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

        return (
            <a href='#' className='errorcolor largetext text-center' onClick={handleSummaryClick}>
                Problem Encountered
            </a>
        );
    }

    /*
     * Return the markup for the modal dialog
     */
    function renderModalDialog(): JSX.Element {

        const title = 'Shell Application Error';
        const errorDetailsProps = {
            title,
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
                contentLabel={title}
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

    // Render the hyperlink as a centred row
    return (
        <>
            <div className='row'>
                <div className='col-6 text-center mx-auto'>
                    {renderHyperlink()}
                </div>
            </div>
            {renderModalDialog()}
        </>
    );
}
