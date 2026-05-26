import EventBus from 'js-event-bus';
import {FetchCacheKeys} from '../../api/client/fetchCacheKeys';
import {FetchClient} from '../../api/client/fetchClient';
import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {ViewModelCoordinator} from '../utilities/viewModelCoordinator';

/*
 * The transactions view model manages API state
 */
export class TransactionsViewModel {

    private readonly fetchClient: FetchClient;
    private readonly eventBus: EventBus;
    private readonly viewModelCoordinator: ViewModelCoordinator;
    private companyId: string | null;
    private transactions: CompanyTransactions | null;
    private error: UIError | null;

    public constructor(
        fetchClient: FetchClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this.fetchClient = fetchClient;
        this.eventBus = eventBus;
        this.viewModelCoordinator = viewModelCoordinator;
        this.companyId = null;
        this.transactions = null;
        this.error = null;
    }

    /*
     * Property accessors
     */
    public getTransactions(): CompanyTransactions | null {
        return this.transactions;
    }

    public getCompanyId(): string {
        return this.companyId || '';
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
    public async callApi(id: string, options?: ViewLoadOptions): Promise<void> {

        const fetchOptions = {
            cacheKey: `${FetchCacheKeys.Transactions}-${id}`,
            forceReload: options?.forceReload || false,
            causeError: options?.causeError || false,
        };

        this.viewModelCoordinator.onMainViewModelLoading();
        this.error = null;
        if (this.companyId !== id) {
            this.transactions = null;
            this.companyId = id;
        }

        try {

            const result = await this.fetchClient.getCompanyTransactions(id, fetchOptions);
            if (result) {
                this.transactions = result;
            }

        } catch (e: any) {

            this.error = ErrorFactory.fromException(e);
            this.transactions = null;

        } finally {

            this.viewModelCoordinator.onMainViewModelLoaded(fetchOptions.cacheKey);
        }
    }

    /*
     * Allow the view to clear data
     */
    public clearData(): void {
        this.transactions = null;
    }

    /*
     * Handle 'business errors' received from the API
     */
    public isForbiddenError(): boolean {

        if (this.error) {

            if (this.error.getStatusCode() === 404 && this.error.getErrorCode() === ErrorCodes.companyNotFound) {

                // User typed an id value outside of allowed company ids
                return true;
            }

            if (this.error.getStatusCode() === 400 && this.error.getErrorCode() === ErrorCodes.invalidCompanyId) {

                // User typed an invalid id such as 'abc'
                return true;
            }
        }

        return false;
    }
}
