import EventBus from 'js-event-bus';
import {BaseErrorFactory, UIError} from '../../plumbing/errors/lib';
import {ApiClient} from '../../api/client/apiClient';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {Company} from '../../api/entities/company';
import {ApiViewEvents} from '../utilities/apiViewEvents';
import {ApiViewNames} from '../utilities/apiViewNames';

/*
 * The view model for the companies container view
 */
export class CompaniesContainerViewModel {

    private readonly _apiClient: ApiClient;
    private readonly _eventBus: EventBus;
    private readonly _apiViewEvents: ApiViewEvents;
    private _companies: Company[];

    public constructor(
        apiClient: ApiClient,
        eventBus: EventBus,
        apiViewEvents: ApiViewEvents,
    ) {
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._apiViewEvents = apiViewEvents;
        this._companies = [];
    }

    /*
     * Property accessors
     */
    public get companies(): Company[] {
        return this._companies;
    }

    public get eventBus(): EventBus {
        return this._eventBus;
    }

    /*
     * Get data from the API and then notify the caller
     */
    public async callApi(
        onSuccess: () => void,
        onError: (error: UIError) => void,
        options?: ApiClientOptions): Promise<void> {

        try {

            this._apiViewEvents.onViewLoading(ApiViewNames.Main);
            const result = await this._apiClient.getCompanyList(options);
            if (result) {
                this._companies = result;
            }
            this._apiViewEvents.onViewLoaded(ApiViewNames.Main);
            onSuccess();

        } catch (e: any) {

            const error = BaseErrorFactory.fromException(e);
            this._apiViewEvents.onViewLoadFailed(ApiViewNames.Main, error);
            onError(error);
        }
    }
}
