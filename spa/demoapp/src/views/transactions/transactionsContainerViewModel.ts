import EventBus from 'js-event-bus';
import {ApiClient} from '../../api/client/apiClient';
import {ApiClientOptions} from '../../api/client/apiClientOptions';
import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {BaseErrorFactory, UIError} from '../../plumbing/errors/lib';
import {ViewNames} from '../utilities/viewNames';
import {ViewModelCoordinator} from '../utilities/viewModelCoordinator';

/*
 * The view model for the transactions container view
 */
export class TransactionsContainerViewModel {

    private readonly _apiClient: ApiClient;
    private readonly _eventBus: EventBus;
    private readonly _viewModelCoordinator: ViewModelCoordinator;
    private _transactions: CompanyTransactions | null;
    private _error: UIError | null;

    public constructor(
        apiClient: ApiClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this._apiClient = apiClient;
        this._eventBus = eventBus;
        this._viewModelCoordinator = viewModelCoordinator;
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

        this._viewModelCoordinator.onViewLoading(ViewNames.Main);
        this._error = null;

        try {

            const result = await this._apiClient.getCompanyTransactions(id, options);
            if (result) {
                this._transactions = result;
            }

        } catch (e: any) {

            this._error = BaseErrorFactory.fromException(e);
            this._transactions = null;

        } finally {

            this._viewModelCoordinator.onViewLoaded(ViewNames.Main);
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
