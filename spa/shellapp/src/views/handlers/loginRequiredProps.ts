/*
 * Input to the login required handler
 */
export interface LoginRequiredProps {
    isAfterLogout: boolean;
    hasError: boolean;
    onLogin: () => void;
}
