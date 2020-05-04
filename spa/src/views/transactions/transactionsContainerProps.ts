import {RouteComponentProps} from 'react-router-dom';
import {ApiClient} from '../../api/client/apiClient';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the transactions container
 */
export interface TransactionsContainerProps extends RouteComponentProps<{id: string}> {

    // The client with which to retrieve data
    apiClient: ApiClient;

    // A callback before the view loads
    onViewLoading: () => void;

    // A callback when the view loads successfully
    onViewLoaded: () => void;

    // A callback when the view loads successfully
    onViewLoadFailed: (error: UIError) => void;

    // Path parameters
    params?: {id: string};
}
