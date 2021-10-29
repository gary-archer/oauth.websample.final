import {UserInfo} from '../../api/entities/userInfo';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * State managed by the user info view
 */
export interface UserInfoViewState {

    // Whether user info should be loaded
    shouldLoad: boolean;

    // Populated when data is successfully loaded
    userInfo: UserInfo | null;

    // Populated when there is an error getting data
    error: UIError | null;
}
