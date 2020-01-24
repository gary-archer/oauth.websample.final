/*
 * Input to the header buttons view
 */
export interface HeaderButtonsViewProps {

    // Whether to enable session related operations
    sessionButtonsEnabled: boolean;

    // Callbacks when they are clicked
    handleHomeClick: () => void;
    handleExpireAccessTokenClick: () => void;
    handleRefreshDataClick: (causeApiError: boolean) => void;
    handleLogoutClick: () => void;
}
