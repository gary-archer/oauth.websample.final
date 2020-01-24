import {UserInfoClaims} from '../../api/entities/userInfoClaims';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * State managed by the user info view
 */
export interface UserInfoViewState {

    // Populated when data is successfully loaded
    claims: UserInfoClaims | null;

    // Populated when there is an error getting data
    error: UIError | null;

    // We keep track of logged out state for use in getDerivedStateFromProps
    isLoggedOut: boolean;
}
