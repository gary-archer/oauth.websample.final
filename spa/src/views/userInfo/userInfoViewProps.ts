import {ApiClient} from '../../api/client/apiClient';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the user info view
 */
export interface UserInfoViewProps {

    // The API client to get data
    apiClient: ApiClient;

    // The logged out state when user info is created
    isLoggedOut: boolean;

    // A callback when the view loads successfully
    onViewLoaded: () => void;

    // A callback when the view loads successfully
    onViewLoadFailed: (error: UIError) => void;
}
