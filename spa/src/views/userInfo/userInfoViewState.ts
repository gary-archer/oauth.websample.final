import {ApiUserInfo} from '../../api/entities/apiUserInfo';
import {OAuthUserInfo} from '../../api/entities/oauthUserInfo';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * State managed by the user info view
 */
export interface UserInfoViewState {
    oauthUserInfo: OAuthUserInfo | null;
    apiUserInfo: ApiUserInfo | null;
    error: UIError | null;
}
