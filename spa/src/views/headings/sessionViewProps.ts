import {ApiClient} from '../../api/client/apiClient';

/*
 * Input to the session view
 */
export interface SessionViewProps {

    // The API client provides the session id value
    apiClient: ApiClient;

    // Visibility
    isVisible: boolean;
}
