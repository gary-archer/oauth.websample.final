import EventBus from 'js-event-bus';
import {GetOptions} from '../../api/client/getOptions';
import {ApiClient} from '../../api/client/apiClient';
import {ErrorCodes} from '../../errors/errorCodes';
import {ErrorFactory} from '../../errors/errorFactory';
import {UIError} from '../../errors/uiError';
import {TransactionsViewState} from './transactionsViewState';

/*
 * The transactions view model manages API state
 */
export class TransactionsViewModel {

    private readonly apiClient: ApiClient;
    private readonly eventBus: EventBus;
    private listener: (() => void) | null;
    private companyId: string | null;
    private snapshot: TransactionsViewState;

    public constructor(apiClient: ApiClient, eventBus: EventBus) {

        this.apiClient = apiClient;
        this.eventBus = eventBus;
        this.listener = null;
        this.companyId = null;
        this.snapshot = {data: null, error: null};
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
    public async callApi(id: string, options: GetOptions, onForbidden: () => void): Promise<void> {

        this.snapshot = {data: this.companyId !== id ? null : this.snapshot.data, error: null};
        this.companyId = id;

        try {

            const result = await this.apiClient.getCompanyTransactions(id, options);
            if (result) {
                this.snapshot = {data: result, error: null};
            }

        } catch (e: any) {

            const error = ErrorFactory.fromException(e);
            if (this.isForbiddenError(error)) {
                this.snapshot = {data: null, error: null};
                onForbidden();
            } else {
                this.snapshot = {data: null, error: ErrorFactory.fromException(e)};
            }

        } finally {

            this.notifyView();
        }
    }

    /*
     * Update the view when the model data changes
     */
    private notifyView(): void {
        if (this.listener) {
            this.listener();
        }
    }

    /*
     * Handle 'business errors' received from the API
     */
    private isForbiddenError(error: UIError): boolean {

        if (error.getStatusCode() === 404 &&
            error.getErrorCode() === ErrorCodes.companyNotFound) {

            // User typed an id value outside of allowed company ids
            return true;
        }

        if (error.getStatusCode() === 400 &&
            error.getErrorCode() === ErrorCodes.invalidCompanyId) {

            // User typed an invalid id such as 'abc'
            return true;
        }

        return false;
    }
}
