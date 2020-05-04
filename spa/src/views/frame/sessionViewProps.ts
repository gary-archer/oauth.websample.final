import {ApiClient} from '../../api/client/apiClient';

/*
 * Input to the session view
 */
export interface SessionViewProps {

    // Visibility
    isVisible: boolean;

    // The API client provides the footer session id
    apiClient: ApiClient;
}
