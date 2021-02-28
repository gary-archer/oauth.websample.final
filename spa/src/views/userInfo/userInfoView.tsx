import React from 'react';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {EventEmitter} from '../../plumbing/events/eventEmitter';
import {EventNames} from '../../plumbing/events/eventNames';
import {ErrorSummaryView} from '../errors/errorSummaryView';
import {ApiViewNames} from '../utilities/apiViewNames';
import {UserInfoViewProps} from './userInfoViewProps';
import {UserInfoViewState} from './userInfoViewState';

/*
 * A simple component to render the logged in user
 */
export class UserInfoView extends React.Component<UserInfoViewProps, UserInfoViewState> {

    /*
     * If the logged out state changes we update state used for rendering
     */
    public static getDerivedStateFromProps(
        nextProps: UserInfoViewProps,
        prevState: UserInfoViewState): UserInfoViewState | null {

        // Return updated state
        if (nextProps.shouldLoad !== prevState.shouldLoad) {
            return {...prevState, shouldLoad: nextProps.shouldLoad};
        }

        // Indicate no changes to state
        return null;
    }

    public constructor(props: UserInfoViewProps) {
        super(props);

        this.state = {
            shouldLoad: props.shouldLoad,
            claims: null,
            error: null,
        };

        this._setupCallbacks();
    }

    /*
     * Render user info both before and after received
     */
    public render(): React.ReactNode {

        // Render errors if there are technical problems getting user info
        if (this.state.error && this.state.error.errorCode !== ErrorCodes.loginRequired) {

            const errorProps = {
                hyperlinkMessage: 'Problem Encountered',
                dialogTitle: 'User Info Error',
                error: this.state.error,
                centred: false,
            };
            return (
                <div className='text-right mx-auto'>
                    <ErrorSummaryView {...errorProps}/>
                </div>
            );
        }

        // Render nothing when logged out
        if (!this.state.shouldLoad || !this.state.claims) {
            return (
                <>
                </>
            );
        }

        // Render the logged in user name otherwise
        const name = `${this.state.claims.givenName} ${this.state.claims.familyName}`;
        return  this.state.claims &&
                (
                    <div className='text-right mx-auto'>
                        <p className='font-weight-bold'>{name}</p>
                    </div>
                );
    }

    /*
     * Load data then listen for the reload event
     */
    public async componentDidMount(): Promise<void> {

        EventEmitter.subscribe(EventNames.ON_RELOAD_USERINFO, this._loadData);
        await this._loadData(false);
    }

    /*
     * Unsubscribe when we unload
     */
    public async componentWillUnmount(): Promise<void> {
        EventEmitter.unsubscribe(EventNames.ON_RELOAD_USERINFO, this._loadData);
    }

    /*
     * Reload data when the user chooses to resume from the logged out page
     */
    public async componentDidUpdate(
        prevProps: UserInfoViewProps,
        prevState: UserInfoViewState): Promise<void> {

        if (!prevState.shouldLoad && this.state.shouldLoad) {
            await this._loadData(false);
        }
    }

    /*
     * Load data when requested
     */
    private async _loadData(causeError: boolean): Promise<void> {

        try {

            // We do not load when the logged out view is active
            if (!this.state.shouldLoad) {
                this.props.events.onViewLoaded(ApiViewNames.UserInfo);
                return;
            }

            this.setState({error: null});

            // Get user info
            this.props.events.onViewLoading(ApiViewNames.UserInfo);
            const claims = await this.props.apiClient.getUserInfo({causeError});
            this.props.events.onViewLoaded(ApiViewNames.UserInfo);

            this.setState({claims});

        } catch (e) {

            const error = ErrorHandler.getFromException(e);
            this.setState({claims: null, error});
            this.props.events.onViewLoadFailed(ApiViewNames.UserInfo, error);
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._loadData = this._loadData.bind(this);
    }
}
