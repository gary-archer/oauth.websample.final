import React, {ErrorInfo} from 'react';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {EventNames} from '../../plumbing/events/eventNames';
import {SetErrorEvent} from '../../plumbing/events/setErrorEvent';
import {ErrorBoundaryProps} from './errorBoundaryProps';
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

        const errorProps = {
            eventBus: this.props.eventBus,
            containingViewName: 'fallback',
            hyperlinkMessage: 'Problem Encountered Rendering Views',
            dialogTitle: 'Rendering Error',
            centred: true,
        };

        // Render children when there are no errors
        if (!this.state.error) {
            return this.props.children;
        }
        
        // Otherwise render a child error summary view
        return <ErrorSummaryView {...errorProps}/>;
    }

    /*
     * Catch errors and translate for display
     */
    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        
        // Update state to force a rerender
        const details = ErrorFactory.fromRenderError(error, errorInfo.componentStack);
        this.setState({error: details});
        
        // Wait for a render so that the error summary view is created, then send it an event
        setTimeout(() => {
            this.props.eventBus.emit(EventNames.SetError, null, new SetErrorEvent('fallback', details));
        }, 1000);
    }
}
