import EventBus from 'js-event-bus';
import {ApiClient} from '../api/client/apiClient';
import {CompaniesViewModel} from '../views/companies/companiesViewModel';
import {TransactionsViewModel} from '../views/transactions/transactionsViewModel';
import {UserInfoViewModel} from '../views/userInfo/userInfoViewModel';

/*
 * Manages global view model objects for the React application
 */
export class ViewModelStore {

    private readonly apiClient: ApiClient;
    private readonly eventBus: EventBus;

    private companiesViewModel: CompaniesViewModel | null;
    private transactionsViewModel: TransactionsViewModel | null;
    private userInfoViewModel: UserInfoViewModel | null;

    /*
     * Set the initial state when the app starts
     */
    public constructor(apiClient: ApiClient, eventBus: EventBus) {

        this.apiClient = apiClient;
        this.eventBus = eventBus;

        this.companiesViewModel = null;
        this.transactionsViewModel = null;
        this.userInfoViewModel = null;
    }

    /*
     * Create the view model on first use
     */
    public getCompaniesViewModel(): CompaniesViewModel {

        if (!this.companiesViewModel) {
            this.companiesViewModel = new CompaniesViewModel(this.apiClient, this.eventBus);
        }

        return this.companiesViewModel;
    }

    /*
     * Create the view model on first use
     */
    public getTransactionsViewModel(): TransactionsViewModel {

        if (!this.transactionsViewModel) {
            this.transactionsViewModel = new TransactionsViewModel(this.apiClient, this.eventBus);
        }

        return this.transactionsViewModel;
    }

    /*
     * Create the view model on first use
     */
    public getUserInfoViewModel(): UserInfoViewModel {

        if (!this.userInfoViewModel) {

            this.userInfoViewModel = new UserInfoViewModel(this.apiClient, this.eventBus);
        }

        return this.userInfoViewModel;
    }
}
