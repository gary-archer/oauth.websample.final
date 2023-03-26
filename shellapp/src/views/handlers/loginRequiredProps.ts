import {UIError} from '../../plumbing/errors/uiError';

/*
 * Input to the login required handler
 */
export interface LoginRequiredProps {
    isAfterLogout: boolean;
    onLogin: () => void;
    error: UIError | null;
}
