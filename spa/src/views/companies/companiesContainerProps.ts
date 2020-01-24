import {ApiClient} from '../../api/client/apiClient';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the companies container
 */
export interface CompaniesContainerProps {

    // The client with which to retrieve data
    apiClient: ApiClient;

    // A callback before the view loads
    onViewLoading: (viewType: string) => void;

    // A callback when the view loads successfully
    onViewLoaded: () => void;

    // A callback when the view loads successfully
    onViewLoadFailed: (error: UIError) => void;

    // Whether to render the mobile view
    isMobileSize: boolean;
}
