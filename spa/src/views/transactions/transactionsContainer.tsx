import React from 'react';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {UIError} from '../../plumbing/errors/uiError';
import {EventEmitter} from '../../plumbing/events/eventEmitter';
import {EventNames} from '../../plumbing/events/eventNames';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {TransactionsContainerProps} from './transactionsContainerProps';
import {TransactionsContainerState} from './transactionsContainerState';
import {TransactionsMainView} from './transactionsMainView';

/*
 * Render the transactions view to replace the existing view
 */
export class TransactionsContainer extends React.Component<TransactionsContainerProps, TransactionsContainerState> {

    /*
     * If the user changes the transaction to a new company the browser bar, the change is received here
     */
    public static getDerivedStateFromProps(
        nextProps: TransactionsContainerProps,
        prevState: TransactionsContainerState): TransactionsContainerState | null {

        // Return updated state
        if (nextProps.match.params.id !== prevState.companyId) {
            return {...prevState, companyId: nextProps.match.params.id};
        }

        // Indicate no changes to state
        return null;
    }

    /*
     * Initial state is received via the React Router
     */
    public constructor(props: TransactionsContainerProps) {
        super(props);

        // Initialise state, and the initial company id is supplied via a path segment
        this.state = {
            companyId: this.props.match.params.id,
            error: null,
            data: null,
        };

        this._setupCallbacks();
    }

    /*
     * Render according to the current state and the type of device
     */
    public render(): React.ReactNode {

        // Render an error on failure
        if (this.state.error) {
            return this._renderError();
        }

        // Display nothing until there is data
        if (!this.state.data) {
            return (
                <>
                </>
            );
        }

        // Display the desktop or mobile view otherwise
        const props = {
            data: this.state.data!,
        };

        return  (
            <TransactionsMainView {...props}/>
        );
    }

    /*
     * Load data then listen for the reload event
     */
    public async componentDidMount(): Promise<void> {

        EventEmitter.subscribe(EventNames.ON_RELOAD, this._loadData);
        await this._loadData(false);
    }

    /*
     * Reload data when the user types a different company id in the browser
     */
    public async componentDidUpdate(
        prevProps: TransactionsContainerProps,
        prevState: TransactionsContainerState): Promise<void> {

        if (this.state.companyId !== prevState.companyId) {
            await this._loadData(false);
        }
    }

    /*
     * Unsubscribe when we unload
     */
    public async componentWillUnmount(): Promise<void> {

        EventEmitter.unsubscribe(EventNames.ON_RELOAD, this._loadData);
    }

    /*
     * Get data from the API and update state
     */
    private async _loadData(causeError: boolean): Promise<void> {

        try {
            // Initialise for this request
            const options = {
                causeError,
            };
            this.setState({error: null});

            // Get data from the API
            this.props.onViewLoading();
            const data = await this.props.apiClient.getCompanyTransactions(this.state.companyId, options);
            this.props.onViewLoaded();

            // Update UI state
            this.setState({data});

        } catch (e) {

            // Handle the error
            const error = ErrorHandler.getFromException(e);
            const isExpected = this._handleApiError(error);
            if (isExpected) {

                // For 'expected' errors, return to the home view
                this.props.onViewLoaded();
                location.hash = '#';

            } else {

                // Indicate failure to the view manager
                this.setState({error});
                this.props.onViewLoadFailed(error);
            }
        }
    }

    /*
     * Output error details if required
     */
    private _renderError(): React.ReactNode {

        if (this.state.error!.errorCode === ErrorCodes.loginRequired) {
            return (
                <>
                </>
            );
        }

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered in Transactions View',
            dialogTitle: 'Transactions View Error',
            error: this.state.error,
            centred: true,
        };
        return (
            <ErrorSummaryView {...errorProps}/>
        );
    }

    /*
     * Handle 'business errors' received from the API
     */
    private _handleApiError(error: UIError) {

        let isExpected = false;

        if (error.statusCode === 404 && error.errorCode === ErrorCodes.companyNotFound) {

            // User typed an id value outside of allowed company ids
            isExpected = true

        } else if (error.statusCode === 400 && error.errorCode === ErrorCodes.invalidCompanyId) {

            // User typed an invalid id such as 'abc'
            isExpected = true
        }

        return isExpected;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._loadData = this._loadData.bind(this);
    }
}
