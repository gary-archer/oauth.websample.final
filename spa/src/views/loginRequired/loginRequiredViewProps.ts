/*
 * Input to the login required view
 */
export interface LoginRequiredViewProps {

    // A callback by which we can inform the app view which view is current
    onLoading: () => void;
}
