import {RouteComponentProps} from 'react-router-dom';
import {ApiClient} from '../../api/client/apiClient';
import {ViewManager} from '../viewManager';

/*
 * Input to the transactions container
 */
export interface TransactionsContainerProps extends RouteComponentProps<{id: string}> {

    // The client with which to retrieve data
    apiClient: ApiClient;

    // The view manager is informed about API load events
    viewManager: ViewManager;

    // Path parameters
    params?: {id: string};
}
