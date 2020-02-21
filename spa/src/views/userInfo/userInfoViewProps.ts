import {ApiClient} from '../../api/client/apiClient';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the user info view
 */
export interface UserInfoViewProps {

    // The API client to get data
    apiClient: ApiClient;

    // Whether the view should load data initially
    initialShouldLoad: boolean;

    // A callback when the view loads successfully
    onViewLoaded: () => void;

    // A callback when the view loads successfully
    onViewLoadFailed: (error: UIError) => void;
}
