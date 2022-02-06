import React, {ErrorInfo} from 'react';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {ErrorBoundaryProps} from './ErrorBoundaryProps';
import {ErrorBoundaryState} from './errorBoundaryState';
import {ErrorSummaryView} from './errorSummaryView';

/*
 * Manages catching of rendering errors anywhere in the tree view during development
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

    /*
     * Update state so the next render will show the fallback UI
     */
    public static getDerivedStateFromError(error: any): any {
        return {error: ErrorFactory.fromRenderError(error)};
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
            eventBus: this.props.eventBus,
            containingViewName: 'boundary',
            hyperlinkMessage: 'Problem Encountered Rendering Views',
            dialogTitle: 'Rendering Error',
            centred: true,
        };
        return (
            <ErrorSummaryView {...errorProps}/>
        );
    }

    /*
     * Catch errors and translate for display
     */
    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        const details = ErrorFactory.fromRenderError(error, errorInfo.componentStack);
        this.setState({error: details});
    }
}
