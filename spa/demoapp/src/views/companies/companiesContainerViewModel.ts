import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {Company} from '../../api/entities/company';
import {BaseErrorFactory, UIError} from '../../plumbing/errors/lib';
import {HttpClientContext} from '../../plumbing/http/httpClientContext';
import {ViewNames} from '../utilities/viewNames';
import {ViewModelCoordinator} from '../utilities/viewModelCoordinator';

/*
 * The view model for the companies container view
 */
export class CompaniesContainerViewModel {

    private readonly _apiClient: ApiClient;
    private readonly _eventBus: EventBus;
    private readonly _viewModelCoordinator: ViewModelCoordinator;
    private _companies: Company[];
    private _error: UIError | null;

    public constructor(
        apiClient: ApiClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._viewModelCoordinator = viewModelCoordinator;
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
    public async callApi(context: HttpClientContext): Promise<void> {

        this._viewModelCoordinator.onViewLoading(ViewNames.Main);
        this._error = null;

        try {

            const result = await this._apiClient.getCompanyList(context);
            if (result) {
                this._companies = result;
                this._viewModelCoordinator.onViewLoaded(ViewNames.Main, [context.url]);
            }

        } catch (e: any) {

            this._error = BaseErrorFactory.fromException(e);
            this._companies = [];
            this._viewModelCoordinator.onViewLoaded(ViewNames.Main, [context.url]);
        }
    }
}
