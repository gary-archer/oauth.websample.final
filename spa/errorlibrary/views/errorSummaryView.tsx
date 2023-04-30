import React, {useEffect, useState} from 'react';
import ReactModal from 'react-modal';
import {BaseErrorFactory} from '../logic/baseErrorFactory';
import {ErrorEventNames} from '../events/errorEventNames';
import {SetErrorEvent} from '../events/setErrorEvent';
import {ErrorDetailsView} from './errorDetailsView';
import {ErrorSummaryViewProps} from './errorSummaryViewProps';
import {ErrorSummaryViewState} from './errorSummaryViewState';

/*
 * Manages rendering of error summary information
 */
export function ErrorSummaryView(props: ErrorSummaryViewProps): JSX.Element {

    const [state, setState] = useState<ErrorSummaryViewState>({
        showDetails: false,
        error: null,
    });

    useEffect(() => {
        startup();
        return () => cleanup();
    }, []);

    /*
     * Subscribe to events and then do the initial load of data
     */
    async function startup(): Promise<void> {
        props.eventBus.on(ErrorEventNames.SetError, onSetError);
    }

    /*
     * Unsubscribe when we unload
     */
    function cleanup(): void {
        props.eventBus.detach(ErrorEventNames.SetError, onSetError);
    }

    /*
     * Update state when we receive an error from the parent
     */
    function onSetError(event: SetErrorEvent): void {

        if (props.containingViewName === event.containingViewName) {

            if (event.error) {

                setState((s) => {
                    return {
                        ...s,
                        error: BaseErrorFactory.fromException(event.error),
                    };
                });

            } else {

                setState((s) => {
                    return {
                        ...s,
                        error: null,
                    };
                });
            }
        }
    }

    /*
     * Return the markup for the hyperlink
     */
    function renderHyperlink(): JSX.Element {

        // This error is expected when there is no auth cookie yet
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
     * Ignore expected errors
     */
    function isNonError() {
        return state.error && props.errorsToIgnore.indexOf(state.error.errorCode) !== -1;
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

    // If there is no real error, do not render anything
    if (isNonError()) {
        return  (
            <>
            </>
        );
    }

    if (props.centred) {

        return (

            // Render the hyperlink as a centred row in the main UI
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

            // Render the hyperlink in a more compact form, used for user info errors
            <>
                {renderHyperlink()}
                {renderModalDialog()}
            </>
        );
    }
}
