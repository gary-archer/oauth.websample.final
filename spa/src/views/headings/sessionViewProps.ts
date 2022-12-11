import EventBus from 'js-event-bus';

/*
 * Input to the session view
 */
export interface SessionViewProps {
    sessionId: string;
    eventBus: EventBus;
}
