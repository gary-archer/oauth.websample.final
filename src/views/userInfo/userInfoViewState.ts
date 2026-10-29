import {ApiUserInfo} from '../../api/entities/apiUserInfo';
import {OAuthUserInfo} from '../../api/entities/oauthUserInfo';
import {UIError} from '../../errors/uiError';

/*
 * The snapshot of state exposed to the view
 */
export interface UserInfoViewState {
    oauthUserInfo: OAuthUserInfo | null;
    apiUserInfo: ApiUserInfo | null;
    error: UIError | null;
}
