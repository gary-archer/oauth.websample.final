import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {Company} from '../../api/entities/company';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {ApiViewEvents} from '../utilities/apiViewEvents';
import {ApiViewNames} from '../utilities/apiViewNames';

/*
 * The view model for the companies container view
 */
export class CompaniesContainerViewModel {

    private readonly _apiClient: ApiClient;
    private readonly _eventBus: EventBus;
    private readonly _apiViewEvents: ApiViewEvents;

    public constructor(
        apiClient: ApiClient,
        eventBus: EventBus,
        apiViewEvents: ApiViewEvents,
    ) {
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._apiViewEvents = apiViewEvents;
    }

    /*
     * Property accessors
     */
    public get eventBus(): EventBus {
        return this._eventBus;
    }

    /*
     * Get data from the API and then notify the caller
     */
    public async callApi(
        onSuccess: (companies: Company[]) => void,
        onError: (error: UIError) => void,
        causeError: boolean): Promise<void> {

        try {

            this._apiViewEvents.onViewLoading(ApiViewNames.Main);

            const companies = await this._apiClient.getCompanyList({causeError});

            this._apiViewEvents.onViewLoaded(ApiViewNames.Main);
            onSuccess(companies);

        } catch (e: any) {

            const error = ErrorFactory.fromException(e);
            this._apiViewEvents.onViewLoadFailed(ApiViewNames.Main, error);
            onError(error);
        }
    }
}
