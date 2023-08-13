import {ApiUserInfo} from '../../api/entities/apiUserInfo';
import {OAuthUserInfo} from '../../plumbing/oauth/oauthUserInfo';

/*
 * State managed by the user info view
 */
export interface UserInfoViewState {
    oauthUserInfo: OAuthUserInfo | null;
    apiUserInfo: ApiUserInfo | null;
}
