import {ApiClient} from '../../api/client/apiClient';
import {ViewManager} from '../viewManager';

/*
 * Input to the companies container
 */
export interface CompaniesContainerProps {

    // The client with which to retrieve data
    apiClient: ApiClient;

    // The view manager is informed about API load events
    viewManager: ViewManager;

    // Whether to render the mobile view
    isMobileSize: boolean;
}
