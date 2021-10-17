/*
 * Input to the header buttons view
 */
export interface HeaderButtonsViewProps {

    // Whether to enable session related operations
    sessionButtonsEnabled: boolean;

    // Callbacks when they are clicked
    handleHomeClick: () => void;
    handleReloadDataClick: (longPressed: boolean) => void;
    handleExpireAccessTokenClick: () => void;
    handleExpireRefreshTokenClick: () => void;
    handleLogoutClick: () => void;
}
