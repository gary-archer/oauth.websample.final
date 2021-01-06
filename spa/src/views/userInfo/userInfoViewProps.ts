import {ApiClient} from '../../api/client/apiClient';
import {ApiViewEvents} from '../utilities/apiViewEvents';

/*
 * Input to the user info view
 */
export interface UserInfoViewProps {

    // The API client to get data
    apiClient: ApiClient;

    // An object via which API related events can be reported
    events: ApiViewEvents;

    // Whether the view should load data initially
    shouldLoad: boolean;
}
