import EventBus from 'js-event-bus';

/*
 * Input to the header buttons view
 */
export interface HeaderButtonsViewProps {

    // Enable the view to subscribe to events
    eventBus: EventBus;

    // Callbacks when they are clicked
    handleHomeClick: () => void;
    handleReloadDataClick: (longPressed: boolean) => void;
    handleExpireAccessTokenClick: () => void;
    handleExpireRefreshTokenClick: () => void;
    handleLogoutClick: () => void;
}
