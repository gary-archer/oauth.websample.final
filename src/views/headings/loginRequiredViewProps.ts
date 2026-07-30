import EventBus from 'js-event-bus';
import {NavigateFunction} from 'react-router';

/*
 * Input to the login required view
 */
export interface LoginRequiredViewProps {
    eventBus: EventBus;
    navigate: NavigateFunction;
}
