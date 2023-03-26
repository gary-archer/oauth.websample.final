/*
 * Input to the login required handler
 */
export interface LoginRequiredProps {
    isAfterLogout: boolean;
    onLogin: () => void;
}
