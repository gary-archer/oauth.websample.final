import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {Company} from '../../api/entities/company';
import {BaseErrorFactory, UIError} from '../../plumbing/errors/lib';
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
    private _error: UIError | null;

    public constructor(
        apiClient: ApiClient,
        eventBus: EventBus,
        apiViewEvents: ApiViewEvents,
    ) {
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._apiViewEvents = apiViewEvents;
        this._companies = [];
        this._error = null;
    }

    /*
     * Property accessors
     */
    public get companies(): Company[] {
        return this._companies;
    }

    public get error(): UIError | null {
        return this._error;
    }

    public get eventBus(): EventBus {
        return this._eventBus;
    }

    /*
     * Get data from the API and then notify the caller
     */
    public async callApi(options?: ApiClientOptions): Promise<void> {

        try {

            this._error = null;
            this._apiViewEvents.onViewLoading(ApiViewNames.Main);
            const result = await this._apiClient.getCompanyList(options);
            if (result && result.length > 0) {
                this._companies = result;
            }
            
            this._apiViewEvents.onViewLoaded(ApiViewNames.Main);

        } catch (e: any) {

            this._error = BaseErrorFactory.fromException(e);
            this._companies = [];
            this._apiViewEvents.onViewLoadFailed(ApiViewNames.Main, this._error);
        }
    }
}
