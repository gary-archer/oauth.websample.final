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
    });

    /*
     * Return the hyperlink and retry button
     */
    function renderSummary(): JSX.Element {

        return (
            <>
                <div className='row'>
                    <div className='col col-12 text-center mx-auto'>
                        <a href='#' className='errorcolor largetext' onClick={handleSummaryClick}>
                            Problem Encountered
                        </a>
                    </div>
                </div>
                <div className='row'>
                    <div className='col col-12 text-center my-2 p-1'>
                        <button
                            onClick={props.onRetry}
                            type='button'
                            className='btn btn-primary w-25 p-1'>Retry</button>
                    </div>
                </div>
            </>
        );
    }

    /*
     * Return the markup for the modal dialog
     */
    function renderModalDialog(): JSX.Element {

        const title = 'Shell Application Error';
        const errorDetailsProps = {
            title,
            error: props.error!,
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

    // Render nothing if there is no error
    if (!props.error) {

        return (
            <>
            </>
        );
    }

    // Otherwise render the link as a centred row, and a modal dialog when the link is clicked
    return (
        <>
            {renderSummary()}
            {renderModalDialog()}
        </>
    );
}
