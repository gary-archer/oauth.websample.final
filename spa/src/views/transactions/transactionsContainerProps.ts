import {RouteComponentProps} from 'react-router-dom';
import {ApiClient} from '../../api/client/apiClient';
import {ApiViewEvents} from '../utilities/apiViewEvents';

/*
 * Input to the transactions container
 */
export interface TransactionsContainerProps extends RouteComponentProps<{id: string}> {

    // A callback by which we can inform the app view which view is current
    onLoading: () => void;

    // The client with which to retrieve data
    apiClient: ApiClient;

    // An object via which API related events can be reported
    events: ApiViewEvents;

    // Path parameters
    params?: {id: string};
}
