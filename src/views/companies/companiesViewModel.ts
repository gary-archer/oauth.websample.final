import EventBus from 'js-event-bus';
import {FetchCacheKeys} from '../../api/client/fetchCacheKeys';
import {FetchClient} from '../../api/client/fetchClient';
import {Company} from '../../api/entities/company';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {ViewModelCoordinator} from '../utilities/viewModelCoordinator';

/*
 * The companies view model manages API state
 */
export class CompaniesViewModel {

    private readonly fetchClient: FetchClient;
    private readonly eventBus: EventBus;
    private readonly viewModelCoordinator: ViewModelCoordinator;
    private companies: Company[];
    private error: UIError | null;

    public constructor(
        fetchClient: FetchClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this.fetchClient = fetchClient;
        this.eventBus = eventBus;
        this.viewModelCoordinator = viewModelCoordinator;
        this.companies = [];
        this.error = null;
    }

    /*
     * Property accessors
     */
    public getCompanies(): Company[] {
        return this.companies;
    }

    public getError(): UIError | null {
        return this.error;
    }

    public getEventBus(): EventBus {
        return this.eventBus;
    }

    /*
     * Get data from the API and then notify the caller
     */
    public async callApi(options?: ViewLoadOptions): Promise<void> {

        const fetchOptions = {
            cacheKey: FetchCacheKeys.Companies,
            forceReload: options?.forceReload || false,
            causeError: options?.causeError || false,
        };

        this.viewModelCoordinator.onMainViewModelLoading();
        this.error = null;

        try {

            const result = await this.fetchClient.getCompanyList(fetchOptions);
            if (result) {
                this.companies = result;
            }

        } catch (e: any) {

            this.companies = [];
            this.error = ErrorFactory.fromException(e);

        } finally {

            this.viewModelCoordinator.onMainViewModelLoaded(fetchOptions.cacheKey);
        }
    }
}
