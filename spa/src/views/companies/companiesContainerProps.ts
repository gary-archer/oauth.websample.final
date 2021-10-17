import {ApiClient} from '../../api/client/apiClient';
import {ApiViewEvents} from '../utilities/apiViewEvents';

/*
 * Input to the companies container
 */
export interface CompaniesContainerProps {

    // A callback by which we can inform the app view which view is current
    onLoading: () => void;

    // The client with which to retrieve data
    apiClient: ApiClient;

    // An object via which API related events can be reported
    events: ApiViewEvents;

    // Whether to render the mobile view
    isMobileSize: boolean;
}
