import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {BaseErrorFactory, UIError} from '../../plumbing/errors/lib';
import {HttpRequestNames} from '../../plumbing/http/httpRequestNames';
import {ApiViewEvents} from '../utilities/apiViewEvents';

/*
 * The view model for the transactions container view
 */
export class TransactionsContainerViewModel {

    private readonly _apiClient: ApiClient;
    private readonly _eventBus: EventBus;
    private readonly _apiViewEvents: ApiViewEvents;
    private _transactions: CompanyTransactions | null;
    private _error: UIError | null;

    public constructor(
        apiClient: ApiClient,
        eventBus: EventBus,
        apiViewEvents: ApiViewEvents,
    ) {
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._apiViewEvents = apiViewEvents;
        this._transactions = null;
        this._error = null;
    }

    /*
     * Property accessors
     */
    public get transactions(): CompanyTransactions | null {
        return this._transactions;
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
    public async callApi(id: string, options?: ApiClientOptions): Promise<void> {

        try {

            this._error = null;
            this._apiViewEvents.onViewLoading(HttpRequestNames.Transactions);
            const result = await this._apiClient.getCompanyTransactions(id, options);
            if (result) {
                this._transactions = result;
            }

            this._apiViewEvents.onViewLoaded(HttpRequestNames.Transactions);

        } catch (e: any) {

            this._error = BaseErrorFactory.fromException(e);
            this._transactions = null;
            this._apiViewEvents.onViewLoadFailed(HttpRequestNames.Transactions, this._error);
        }
    }

    /*
     * Handle 'business errors' received from the API
     */
    public isExpectedApiError(): boolean {

        if(this._error) {

            if (this._error.statusCode === 404 && this._error.errorCode === ErrorCodes.companyNotFound) {

                // User typed an id value outside of allowed company ids
                return true;
            }

            if (this._error.statusCode === 400 && this._error.errorCode === ErrorCodes.invalidCompanyId) {

                // User typed an invalid id such as 'abc'
                return true;
            }
        }

        return false;
    }
}
