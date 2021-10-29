import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {ApiViewEvents} from '../utilities/apiViewEvents';

/*
 * The view model for the transactions container view
 */
export interface TransactionsContainerViewModel {

    // The client with which to retrieve data
    apiClient: ApiClient;

    // An object via which API related events can be reported
    eventBus: EventBus;

    // An object via which API related events can be reported
    apiViewEvents: ApiViewEvents;
}
