import React from 'react';
import {AppErrorProps} from './appErrorProps';
import {AppErrorState} from './appErrorState';
import {ErrorSummaryView} from './errorSummaryView';

/*
 * Manages rendering of application level errors, such as those during startup or login
 */
export class AppErrorView extends React.Component<AppErrorProps, AppErrorState> {

    /*
     * If the error state changes we update state used for rendering
     */
    public static getDerivedStateFromProps(
        nextProps: AppErrorProps,
        prevState: AppErrorState): AppErrorState | null {

        // Return updated state
        if (nextProps.initialArea !== prevState.area || nextProps.initialError !== prevState.error) {
            return {area: nextProps.initialArea, error: nextProps.initialError};
        }

        // Indicate no changes to state
        return null;
    }

    public constructor(props: any) {
        super(props);

        this.state = {
            area: props.initialArea,
            error: props.initialError,
        };
    }

    /*
     * Render the error hyperlink, and show the modal dialog when the user selects it
     */
    public render(): React.ReactNode {

        if (!this.state.error) {
            return  (
                <>
                </>
            );
        }

        const errorProps = {
            hyperlinkMessage: `${this.state.area} Problem Encountered`,
            dialogTitle: `${this.state.area} Error`,
            error: this.state.error,
        };

        return (
            <div className='row'>
                <div className='col-6 text-center mx-auto'>
                    <ErrorSummaryView {...errorProps}/>
                </div>
            </div>
        );
    }
}
