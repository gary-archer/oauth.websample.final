/*
 * Input to the logout view
 */
export interface LogoutViewProps {

    // A callback when the view is loading
    onViewLoading: (viewType: string) => void;

    // A callback when the view loads successfully
    onViewLoaded: () => void;
}
