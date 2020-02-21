import React, {ErrorInfo} from 'react';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {ErrorBoundaryState} from './errorBoundaryState';
import {ErrorSummaryView} from './errorSummaryView';

/*
 * Manages catching of rendering errors anywhere in the tree view during development
 */
export class ErrorBoundary extends React.Component<any, ErrorBoundaryState> {

    /*
     * Update state so the next render will show the fallback UI
     */
    public static getDerivedStateFromError(error: any) {
        return {error: ErrorHandler.getFromRenderError(error)};
      }

    /*
     * Initialise to the default state where there is no error and children are rendered
     */
    public constructor(props: any) {
        super(props);

        this.state = {
            error: null,
        };
    }

    /*
     * Render children, or an error if a component has failed to render
     */
    public render(): React.ReactNode {

        if (!this.state.error) {
            return this.props.children;
        }

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered Rendering Views',
            dialogTitle: 'Rendering Error',
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

    /*
     * Catch errors and translate for display
     */
    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        const details = ErrorHandler.getFromRenderError(error, errorInfo.componentStack);
        this.setState({error: details});
    }
}
