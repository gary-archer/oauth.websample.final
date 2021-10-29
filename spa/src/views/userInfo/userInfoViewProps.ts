import {UserInfoViewModel} from './userInfoViewModel';

/*
 * Input to the user info view
 */
export interface UserInfoViewProps {

    // Whether the view should load data initially
    shouldLoad: boolean;

    // Whether the view should load data initially
    viewModel: UserInfoViewModel;
}
