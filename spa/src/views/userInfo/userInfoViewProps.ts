import {ApiClient} from '../../api/client/apiClient';
import {ViewManager} from '../viewManager';

/*
 * Input to the user info view
 */
export interface UserInfoViewProps {

    // The API client to get data
    apiClient: ApiClient;

    // The view manager is informed about API load events
    viewManager: ViewManager;

    // Whether the view should load data initially
    shouldLoad: boolean;
}
