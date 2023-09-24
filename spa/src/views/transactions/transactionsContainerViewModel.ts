import EventBus from 'js-event-bus';
import {Dispatch, SetStateAction, useState} from 'react';
import {FetchCacheKeys} from '../../api/client/fetchCacheKeys';
import {FetchClient} from '../../api/client/fetchClient';
import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {ViewModelCoordinator} from '../utilities/viewModelCoordinator';

/*
 * The view model for the transactions container view
 */
export class TransactionsContainerViewModel {

    private readonly _fetchClient: FetchClient;
    private readonly _eventBus: EventBus;
    private readonly _viewModelCoordinator: ViewModelCoordinator;
    private _companyId: string | null;
    private _transactions: CompanyTransactions | null;
    private _error: UIError | null;
    private _setTransactions: Dispatch<SetStateAction<CompanyTransactions | null>> | null;
    private _setError: Dispatch<SetStateAction<UIError | null>> | null;

    public constructor(
        fetchClient: FetchClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this._fetchClient = fetchClient;
        this._eventBus = eventBus;
        this._viewModelCoordinator = viewModelCoordinator;
        this._companyId = null;
        this._transactions = null;
        this._error = null;
        this._setTransactions = null;
        this._setError = null;
    }

    /*
     * For the correct React behavior, the view initializes state every time it loads
     */
    public useState(): void {

        const [, setTransactions] = useState(this._transactions);
        this._setTransactions = setTransactions;

        const [, setError] = useState(this._error);
        this._setError = setError;
    }

    /*
     * Property accessors
     */
    public get transactions(): CompanyTransactions | null {
        return this._transactions;
    }

    public get companyId(): string {
        return this._companyId!;
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
    public async callApi(id: string, options?: ViewLoadOptions): Promise<void> {

        const fetchOptions = {
            cacheKey: `${FetchCacheKeys.Transactions}-${id}`,
            forceReload: options?.forceReload || false,
            causeError: options?.causeError || false,
        };

        this._viewModelCoordinator.onMainViewModelLoading();
        this._updateError(null);
        if (this._companyId !== id) {
            this._updateTransactions(null);
            this._companyId = id;
        }

        try {

            const result = await this._fetchClient.getCompanyTransactions(id, fetchOptions);
            if (result) {
                this._updateTransactions(result);
            }

        } catch (e: any) {

            this._updateError(ErrorFactory.fromException(e));
            this._updateTransactions(null);

        } finally {

            this._viewModelCoordinator.onMainViewModelLoaded(fetchOptions.cacheKey);
        }
    }

    /*
     * Allow the view to clear data
     */
    public clearData(): void {
        this._transactions = null;
    }

    /*
     * Handle 'business errors' received from the API
     */
    public isForbiddenError(): boolean {

        if (this._error) {

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

    /*
     * Update state and the binding system
     */
    private _updateTransactions(transactions: CompanyTransactions | null): void {
        this._transactions = transactions;
        this._setTransactions!(this._transactions);
    }

    /*
     * Update state and the binding system
     */
    private _updateError(error: UIError | null): void {
        this._error = error;
        this._setError!(this._error);
    }
}
