import React, {ErrorInfo} from 'react';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {ErrorBoundaryState} from './errorBoundaryState';
import {ErrorDetailsView} from './errorDetailsView';

/*
 * Manages catching of rendering errors anywhere in the tree view during development
 */
export class ErrorBoundary extends React.Component<any, ErrorBoundaryState> {

    /*
     * Update state so the next render will show the fallback UI
     */
    public static getDerivedStateFromError(error: any): any {
        return {error: ErrorFactory.fromRenderError(error, '')};
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

        // Render children by default
        if (!this.state.error) {
            /* eslint-disable react/prop-types */
            return this.props.children;
        }

        // Otherwise render a worst case fallback error view
        const errorDetailsProps = {
            title: 'Problem Encountered Rendering Views',
            error: this.state.error,
        };
        return <ErrorDetailsView {...errorDetailsProps}/>;
    }

    /*
     * Catch errors and update state ready for display
     */
    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {

        const stack = errorInfo.componentStack || '';
        const details = ErrorFactory.fromRenderError(error, stack);
        this.setState({error: details});
    }
}
