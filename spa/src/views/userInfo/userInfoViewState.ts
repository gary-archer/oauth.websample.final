import {UserInfo} from '../../api/entities/userInfo';

/*
 * State managed by the user info view
 */
export interface UserInfoViewState {
    userInfo: UserInfo | null;
}
