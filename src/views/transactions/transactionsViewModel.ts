import EventBus from 'js-event-bus';
import {FetchCacheKeys} from '../../api/client/fetchCacheKeys';
import {FetchClient} from '../../api/client/fetchClient';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {ViewModelCoordinator} from '../utilities/viewModelCoordinator';
import {TransactionsViewState} from './transactionsViewState';

/*
 * The transactions view model manages API state
 */
export class TransactionsViewModel {

    private readonly fetchClient: FetchClient;
    private readonly eventBus: EventBus;
    private readonly viewModelCoordinator: ViewModelCoordinator;
    private listener: (() => void) | null;
    private companyId: string | null;
    private snapshot: TransactionsViewState;

    public constructor(
        fetchClient: FetchClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this.fetchClient = fetchClient;
        this.eventBus = eventBus;
        this.viewModelCoordinator = viewModelCoordinator;
        this.listener = null;
        this.companyId = null;
        this.snapshot = {transactions: null, error: null};
    }

    /*
     * Subscribe a listener for useSyncExternalStore and return an unsubscribe function
     */
    public subscribe(listener: () => void): () => void {

        this.listener = listener;
        return () => {
            this.listener = null;
        };
    }

    /*
     * Return the current state
     */
    public getSnapshot(): TransactionsViewState {
        return this.snapshot;
    }

    /*
     * Enable the view to use the EventBus
     */
    public getEventBus(): EventBus {
        return this.eventBus;
    }

    /*
     * Get data from the API and notify the view
     */
    public async callApi(id: string, options?: ViewLoadOptions): Promise<void> {

        const fetchOptions = {
            cacheKey: `${FetchCacheKeys.Transactions}-${id}`,
            forceReload: options?.forceReload || false,
            causeError: options?.causeError || false,
        };

        this.viewModelCoordinator.onMainViewModelLoading();
        this.snapshot = {transactions: this.companyId !== id ? null : this.snapshot.transactions, error: null};
        this.companyId = id;

        try {

            const result = await this.fetchClient.getCompanyTransactions(id, fetchOptions);
            if (result) {
                this.snapshot = {transactions: result, error: null};
            }

        } catch (e: any) {

            this.snapshot = {transactions: null, error: ErrorFactory.fromException(e)};

        } finally {

            this.viewModelCoordinator.onMainViewModelLoaded(fetchOptions.cacheKey);
            this.notifyView();
        }
    }

    /*
     * Handle 'business errors' received from the API
     */
    public isForbiddenError(): boolean {

        if (this.snapshot.error) {

            if (this.snapshot.error.getStatusCode() === 404 &&
                this.snapshot.error.getErrorCode() === ErrorCodes.companyNotFound) {

                // User typed an id value outside of allowed company ids
                return true;
            }

            if (this.snapshot.error.getStatusCode() === 400 &&
                this.snapshot.error.getErrorCode() === ErrorCodes.invalidCompanyId) {

                // User typed an invalid id such as 'abc'
                return true;
            }
        }

        return false;
    }

    /*
     * Update the view when the model data changes
     */
    private notifyView(): void {
        if (this.listener) {
            this.listener();
        }
    }
}
